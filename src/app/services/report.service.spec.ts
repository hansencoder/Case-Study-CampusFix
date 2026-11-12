import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCamera, mockFilesystem } = vi.hoisted(() => ({
  mockCamera: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    takePhoto: vi.fn(),
    chooseFromGallery: vi.fn(),
  },
  mockFilesystem: {
    mkdir: vi.fn(),
    copy: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn(),
    getUri: vi.fn(),
    deleteFile: vi.fn(),
  },
}));

vi.mock('@capacitor/camera', () => ({
  Camera: mockCamera,
  CameraErrorCode: {
    CameraPermissionDenied: 'OS-PLUG-CAMR-0003',
    GalleryPermissionDenied: 'OS-PLUG-CAMR-0005',
    TakePhotoCancelled: 'OS-PLUG-CAMR-0006',
    NoCameraAvailable: 'OS-PLUG-CAMR-0007',
    ChooseMediaCancelled: 'OS-PLUG-CAMR-0020',
  },
  EncodingType: {
    JPEG: 0,
    PNG: 1,
  },
  MediaTypeSelection: {
    Photo: 0,
    Video: 1,
    All: 2,
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: mockFilesystem,
  Directory: {
    Data: 'DATA',
  },
}));

import { ReportService, REPORTS_STORAGE_KEY } from './report.service';

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    await Preferences.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportService);
  });

  it('should return an empty array when no reports are stored', async () => {
    const reports = await service.getReports();
    expect(reports).toEqual([]);
  });

  it('should safely return an empty array when stored JSON is malformed or not an array', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await Preferences.set({ key: REPORTS_STORAGE_KEY, value: '{bad-json' });
    expect(await service.getReports()).toEqual([]);

    await Preferences.set({ key: REPORTS_STORAGE_KEY, value: '{"not":"array"}' });
    expect(await service.getReports()).toEqual([]);

    expect(warnSpy).toHaveBeenCalled();
  });

  it('should create reports with unique IDs, ISO timestamps, local-only status, and sort newest first', async () => {
    const first = await service.createReport({
      category: 'Electrical',
      location: '  Science Building Room 204  ',
      title: '  Flickering ceiling light  ',
      description: '  Two fluorescent tubes flicker continuously.  ',
    });

    expect(first.id).toBeTruthy();
    expect(first.ticketCode).toMatch(/^#CF-/);
    expect(first.status).toBe('Saved locally');
    expect(first.urgency).toBe('Standard');
    expect(first.location).toBe('Science Building Room 204');
    expect(first.title).toBe('Flickering ceiling light');
    expect(first.description).toBe('Two fluorescent tubes flicker continuously.');
    expect(first.photoPath).toBeNull();
    expect(Number.isNaN(Date.parse(first.createdAt))).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 10));

    const second = await service.createReport({
      category: 'Plumbing',
      location: 'Main Library 1F Restroom',
      title: 'Leaking sink faucet',
      description: 'Cold water tap drips constantly.',
      urgency: 'Urgent',
      status: 'Draft',
      photoPath: 'campusfix-photos/sample.jpg',
    });

    expect(second.id).not.toBe(first.id);
    expect(second.urgency).toBe('Urgent');
    expect(second.status).toBe('Draft');

    const reports = await service.getReports();
    expect(reports.length).toBe(2);
    expect(reports[0].id).toBe(second.id);
    expect(reports[1].id).toBe(first.id);
  });

  it('should retrieve a report by ID or return null when not found', async () => {
    const created = await service.createReport({
      category: 'Other Defect',
      location: 'Room 101',
      title: 'Broken chair',
      description: 'One leg is loose.',
    });

    const found = await service.getReportById(created.id);
    expect(found?.title).toBe('Broken chair');

    const missing = await service.getReportById('non-existent-id');
    expect(missing).toBeNull();
  });

  it('should update an existing report and keep its id, ticket and timestamp', async () => {
    const created = await service.createReport({
      category: 'Plumbing',
      location: 'Room 1',
      title: 'Old title',
      description: 'Old description',
    });

    const updated = await service.updateReport(created.id, {
      category: 'Electrical',
      location: ' Room 2 ',
      title: ' New title ',
      description: 'New description',
      urgency: 'Urgent',
    });

    expect(updated?.id).toBe(created.id);
    expect(updated?.ticketCode).toBe(created.ticketCode);
    expect(updated?.createdAt).toBe(created.createdAt);
    expect(updated?.title).toBe('New title');
    expect(updated?.location).toBe('Room 2');
    expect((await service.getReportById(created.id))?.category).toBe('Electrical');
    expect(await service.updateReport('missing', {
      category: 'Plumbing', location: 'x', title: 'x', description: 'x',
    })).toBeNull();
  });

  it('should delete a report and its photo file', async () => {
    mockFilesystem.deleteFile.mockResolvedValue(undefined);
    const created = await service.createReport({
      category: 'Plumbing',
      location: 'Room 1',
      title: 'To delete',
      description: 'Desc',
      photoPath: 'campusfix-photos/a.jpg',
    });

    expect(await service.deleteReport(created.id)).toBe(true);
    expect(await service.getReportById(created.id)).toBeNull();
    expect(mockFilesystem.deleteFile).toHaveBeenCalledWith({
      path: 'campusfix-photos/a.jpg',
      directory: 'DATA',
    });
    expect(await service.deleteReport(created.id)).toBe(false);
  });

  it('should handle camera permission denial gracefully on native platforms', async () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
    mockCamera.checkPermissions.mockResolvedValue({
      camera: 'prompt',
      photos: 'granted',
    });
    mockCamera.requestPermissions.mockResolvedValue({
      camera: 'prompt-with-rationale',
      photos: 'granted',
    });

    const result = await service.captureIssuePhoto();
    expect(result.status).toBe('denied');
    expect(mockCamera.takePhoto).not.toHaveBeenCalled();
  });

  it('should handle camera capture cancellation gracefully', async () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);
    mockCamera.takePhoto.mockRejectedValue({
      code: 'OS-PLUG-CAMR-0006',
      message: 'User cancelled',
    });

    const result = await service.captureIssuePhoto();
    expect(result.status).toBe('cancelled');
  });

  it('should persist captured photo to Filesystem and return preview URL', async () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);
    mockCamera.takePhoto.mockResolvedValue({
      type: 0,
      thumbnail: 'ZmFrZS1pbWFnZS1kYXRh',
      webPath: 'blob:http://localhost/mock-photo',
      saved: false,
    });
    mockFilesystem.mkdir.mockResolvedValue(undefined);
    mockFilesystem.writeFile.mockResolvedValue({
      uri: 'campusfix-photos/mock.jpg',
    });
    mockFilesystem.readFile.mockResolvedValue({
      data: 'ZmFrZS1pbWFnZS1kYXRh',
    });

    const result = await service.captureIssuePhoto();
    expect(mockFilesystem.mkdir).toHaveBeenCalled();
    expect(mockFilesystem.writeFile).toHaveBeenCalled();
    expect(result.status).toBe('captured');
    if (result.status === 'captured') {
      expect(result.photoPath).toContain('campusfix-photos/report-');
      expect(result.previewUrl).toContain('data:image/jpeg;base64,');
    }
  });

  it('should return null when resolving a null or missing photo path', async () => {
    expect(await service.resolvePhotoUrl(null)).toBeNull();

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
    mockFilesystem.stat.mockRejectedValue(new Error('File not found'));

    expect(await service.resolvePhotoUrl('campusfix-photos/missing.jpg')).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('should persist uploaded gallery photo to Filesystem and handle cancellation', async () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);
    mockCamera.chooseFromGallery.mockResolvedValue({
      results: [
        {
          type: 0,
          thumbnail: 'dXBsb2FkZWQtaW1hZ2U=',
          webPath: 'blob:http://localhost/uploaded-photo',
          saved: false,
        },
      ],
    });
    mockFilesystem.mkdir.mockResolvedValue(undefined);
    mockFilesystem.writeFile.mockResolvedValue({
      uri: 'campusfix-photos/uploaded.jpg',
    });
    mockFilesystem.readFile.mockResolvedValue({
      data: 'dXBsb2FkZWQtaW1hZ2U=',
    });

    const uploaded = await service.pickIssuePhotoFromGallery();
    expect(uploaded.status).toBe('captured');
    if (uploaded.status === 'captured') {
      expect(uploaded.photoPath).toContain('campusfix-photos/report-');
    }

    mockCamera.chooseFromGallery.mockRejectedValue({
      code: 'OS-PLUG-CAMR-0020',
      message: 'User cancelled',
    });
    const cancelled = await service.pickIssuePhotoFromGallery();
    expect(cancelled.status).toBe('cancelled');
  });
});
