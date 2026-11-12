import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  Camera,
  CameraErrorCode,
  EncodingType,
  MediaResult,
  MediaTypeSelection,
} from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

import {
  CreateReportInput,
  PhotoCaptureResult,
  REPORT_CATEGORIES,
  Report,
  ReportCategory,
  ReportStatus,
  ReportUrgency,
} from '../models/report.model';

export const REPORTS_STORAGE_KEY = 'campusfix_reports';
export const PHOTO_DIRECTORY = 'campusfix-photos';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  /**
   * Retrieve all locally saved reports, sorted newest first.
   * Safely handles empty or malformed stored data without crashing.
   */
  async getReports(): Promise<Report[]> {
    const { value } = await Preferences.get({ key: REPORTS_STORAGE_KEY });
    if (!value || !value.trim()) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        console.warn('CampusFix: stored reports value is not an array.');
        return [];
      }

      const validReports = parsed
        .map((item) => this.normalizeReport(item))
        .filter((item): item is Report => item !== null);

      return this.sortNewestFirst(validReports);
    } catch (error) {
      console.warn('CampusFix: failed to parse stored reports JSON.', error);
      return [];
    }
  }

  /**
   * Find a single locally saved report by its unique ID.
   */
  async getReportById(id: string): Promise<Report | null> {
    if (!id) {
      return null;
    }
    const reports = await this.getReports();
    return reports.find((report) => report.id === id) ?? null;
  }

  /**
   * Create and persist a new maintenance report on this device.
   */
  async createReport(input: CreateReportInput): Promise<Report> {
    const existing = await this.getReports();
    const id = this.generateReportId();

    const newReport: Report = {
      id,
      ticketCode: this.generateTicketCode(id),
      category: input.category,
      location: input.location.trim(),
      title: input.title.trim(),
      description: input.description.trim(),
      urgency: input.urgency ?? 'Standard',
      photoPath: input.photoPath ?? null,
      createdAt: new Date().toISOString(),
      status: input.status ?? 'Saved locally',
    };

    const updated = this.sortNewestFirst([newReport, ...existing]);
    await Preferences.set({
      key: REPORTS_STORAGE_KEY,
      value: JSON.stringify(updated),
    });

    return newReport;
  }

  /**
   * Update an existing report's editable fields. Keeps id, ticket code and
   * creation time. Returns the updated report, or null if it was not found.
   */
  async updateReport(
    id: string,
    changes: CreateReportInput
  ): Promise<Report | null> {
    const existing = await this.getReports();
    const index = existing.findIndex((report) => report.id === id);
    if (index < 0) {
      return null;
    }

    const current = existing[index];
    const updatedReport: Report = {
      ...current,
      category: changes.category,
      location: changes.location.trim(),
      title: changes.title.trim(),
      description: changes.description.trim(),
      urgency: changes.urgency ?? current.urgency,
      status: changes.status ?? current.status,
      photoPath:
        changes.photoPath === undefined ? current.photoPath : changes.photoPath,
    };

    const updated = [...existing];
    updated[index] = updatedReport;
    await this.saveAll(updated);
    return updatedReport;
  }

  /**
   * Permanently delete (cancel) a report and its attached photo file.
   * Returns true when a report was removed.
   */
  async deleteReport(id: string): Promise<boolean> {
    const existing = await this.getReports();
    const target = existing.find((report) => report.id === id);
    if (!target) {
      return false;
    }

    await this.saveAll(existing.filter((report) => report.id !== id));
    await this.deletePhotoFile(target.photoPath);
    return true;
  }

  private async saveAll(reports: Report[]): Promise<void> {
    await Preferences.set({
      key: REPORTS_STORAGE_KEY,
      value: JSON.stringify(this.sortNewestFirst(reports)),
    });
  }

  /**
   * Request camera permission if needed, open the device camera, and persist
   * the captured image into the app's private data directory.
   */
  async captureIssuePhoto(): Promise<PhotoCaptureResult> {
    try {
      if (Capacitor.isNativePlatform()) {
        const permState = await Camera.checkPermissions();
        let cameraStatus = permState.camera;

        if (cameraStatus !== 'granted') {
          const requested = await Camera.requestPermissions({
            permissions: ['camera'],
          });
          cameraStatus = requested.camera;
        }

        if (cameraStatus !== 'granted') {
          return {
            status: 'denied',
            message:
              'Camera permission was denied. You can enable Camera access in your device settings, or continue saving your report without a photo.',
          };
        }
      } 

      const media = await Camera.takePhoto({
        quality: 75,
        targetWidth: 1600,
        targetHeight: 1600,
        correctOrientation: true,
        encodingType: EncodingType.JPEG,
        saveToGallery: false,
        editable: 'no',
      });

      return await this.saveMediaResult(media);
    } catch (error) {
      return this.mapCameraError(error);
    }
  }

  /**
   * Open the device photo gallery or file picker so the user can upload an
   * existing image, then persist it into the app's private data directory.
   */
  async pickIssuePhotoFromGallery(): Promise<PhotoCaptureResult> {
    try {
      const { results } = await Camera.chooseFromGallery({
        mediaType: MediaTypeSelection.Photo,
        allowMultipleSelection: false,
        quality: 75,
        targetWidth: 1600,
        targetHeight: 1600,
        correctOrientation: true,
        editable: 'no',
      });

      const media = results?.[0];
      if (!media) {
        return { status: 'cancelled' };
      }

      return await this.saveMediaResult(media);
    } catch (error) {
      return this.mapCameraError(error);
    }
  }

  private async saveMediaResult(
    media: MediaResult
  ): Promise<PhotoCaptureResult> {
    const photoPath = await this.persistCapturedPhoto(media);
    const previewUrl =
      (await this.resolvePhotoUrl(photoPath)) ?? media.webPath ?? '';

    if (!previewUrl) {
      return {
        status: 'error',
        message:
          'The photo was selected, but its preview could not be loaded. You can try again or save without a photo.',
      };
    }

    return {
      status: 'captured',
      photoPath,
      previewUrl,
    };
  }

  /**
   * Resolve a stored relative photo path in Directory.Data to an image URL
   * usable by an <img> element. Returns null if the file is missing or unreadable.
   */
  async resolvePhotoUrl(photoPath: string | null): Promise<string | null> {
    if (!photoPath) {
      return null;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await Filesystem.stat({
          path: photoPath,
          directory: Directory.Data,
        });
        const { uri } = await Filesystem.getUri({
          path: photoPath,
          directory: Directory.Data,
        });
        return Capacitor.convertFileSrc(uri);
      }

      const file = await Filesystem.readFile({
        path: photoPath,
        directory: Directory.Data,
      });

      if (typeof file.data === 'string') {
        if (!file.data) {
          return null;
        }
        return file.data.startsWith('data:')
          ? file.data
          : `data:image/jpeg;base64,${file.data}`;
      }

      if (file.data instanceof Blob) {
        return URL.createObjectURL(file.data);
      }

      return null;
    } catch (error) {
      console.warn('CampusFix: unable to load photo from storage.', error);
      return null;
    }
  }

  /**
   * Remove a previously stored photo file from app storage (e.g., if user
   * removes or retakes an unsaved photo).
   */
  async deletePhotoFile(photoPath: string | null): Promise<void> {
    if (!photoPath) {
      return;
    }

    try {
      await Filesystem.deleteFile({
        path: photoPath,
        directory: Directory.Data,
      });
    } catch {
      // Ignore missing files during cleanup
    }
  }

  private async persistCapturedPhoto(media: MediaResult): Promise<string> {
    await this.ensurePhotoDirectory();
    const destPath = `${PHOTO_DIRECTORY}/report-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.jpg`;

    if (media.uri) {
      const sourceUri =
        media.uri.startsWith('file://') || media.uri.startsWith('content://')
          ? media.uri
          : `file://${media.uri}`;
      try {
        await Filesystem.copy({
          from: sourceUri,
          to: destPath,
          toDirectory: Directory.Data,
        });
        return destPath;
      } catch (copyError) {
        console.warn(
          'CampusFix: direct file copy failed, falling back to data write.',
          copyError
        );
      }
    }

    if (media.thumbnail) {
      const base64 = media.thumbnail.includes(',')
        ? media.thumbnail.split(',')[1]
        : media.thumbnail;
      await Filesystem.writeFile({
        path: destPath,
        data: base64,
        directory: Directory.Data,
        recursive: true,
      });
      return destPath;
    }

    if (media.webPath) {
      const response = await fetch(media.webPath);
      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);
      await Filesystem.writeFile({
        path: destPath,
        data: base64,
        directory: Directory.Data,
        recursive: true,
      });
      return destPath;
    }

    throw new Error('No image data returned from camera.');
  }

  private async ensurePhotoDirectory(): Promise<void> {
    try {
      await Filesystem.mkdir({
        path: PHOTO_DIRECTORY,
        directory: Directory.Data,
        recursive: true,
      });
    } catch {
      // Directory likely already exists
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Failed to convert image data.'));
          return;
        }
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = () => reject(new Error('Failed to read image blob.'));
      reader.readAsDataURL(blob);
    });
  }

  private mapCameraError(error: unknown): PhotoCaptureResult {
    const errObj = error as { code?: string; message?: string } | undefined;
    const code = errObj?.code ?? '';
    const message = (errObj?.message ?? '').toLowerCase();

    if (
      code === CameraErrorCode.TakePhotoCancelled ||
      code === CameraErrorCode.ChooseMediaCancelled ||
      message.includes('cancel') ||
      message.includes('no file selected')
    ) {
      return { status: 'cancelled' };
    }

    if (
      code === CameraErrorCode.CameraPermissionDenied ||
      code === CameraErrorCode.GalleryPermissionDenied ||
      message.includes('permission') ||
      message.includes('denied')
    ) {
      return {
        status: 'denied',
        message:
          'Photo or camera permission was denied. You can enable access in your device settings, or save the report without a photo.',
      };
    }

    if (
      code === CameraErrorCode.NoCameraAvailable ||
      message.includes('no camera') ||
      message.includes('unavailable')
    ) {
      return {
        status: 'error',
        message:
          'No usable camera was found on this device. You can still submit your report without a photo.',
      };
    }

    return {
      status: 'error',
      message:
        'Could not capture a photo right now. You can try again or continue without a photo.',
    };
  }

  private normalizeReport(raw: unknown): Report | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const record = raw as Record<string, unknown>;
    if (
      typeof record['id'] !== 'string' ||
      !record['id'].trim() ||
      typeof record['title'] !== 'string' ||
      typeof record['location'] !== 'string' ||
      typeof record['description'] !== 'string' ||
      typeof record['createdAt'] !== 'string'
    ) {
      return null;
    }

    const rawCategory = record['category'];
    const category = this.normalizeCategory(rawCategory);

    const rawUrgency = record['urgency'];
    const urgency: ReportUrgency =
      rawUrgency === 'Low' || rawUrgency === 'Standard' || rawUrgency === 'Urgent'
        ? rawUrgency
        : 'Standard';

    const rawStatus = record['status'];
    const status: ReportStatus =
      rawStatus === 'Draft' ? 'Draft' : 'Saved locally';

    const photoPath =
      typeof record['photoPath'] === 'string' && record['photoPath'].trim()
        ? record['photoPath']
        : null;

    const ticketCode =
      typeof record['ticketCode'] === 'string' && record['ticketCode'].trim()
        ? record['ticketCode']
        : this.generateTicketCode(record['id']);

    return {
      id: record['id'],
      ticketCode,
      category,
      location: record['location'],
      title: record['title'],
      description: record['description'],
      urgency,
      photoPath,
      createdAt: record['createdAt'],
      status,
    };
  }

  private normalizeCategory(rawCategory: unknown): ReportCategory {
    if (
      typeof rawCategory === 'string' &&
      (REPORT_CATEGORIES as readonly string[]).includes(rawCategory)
    ) {
      return rawCategory as ReportCategory;
    }
    if (rawCategory === 'Cleanliness') {
      return 'Safety Hazard';
    }
    if (rawCategory === 'Furniture' || rawCategory === 'Other') {
      return 'Other Defect';
    }
    return 'Other Defect';
  }

  private generateTicketCode(id: string): string {
    const clean = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `#CF-${(clean.slice(0, 4) || '0001')}`;
  }

  private sortNewestFirst(reports: Report[]): Report[] {
    return [...reports].sort((a, b) => {
      const timeA = Date.parse(a.createdAt);
      const timeB = Date.parse(b.createdAt);
      const validA = Number.isNaN(timeA) ? 0 : timeA;
      const validB = Number.isNaN(timeB) ? 0 : timeB;
      return validB - validA;
    });
  }

  private generateReportId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `rep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

