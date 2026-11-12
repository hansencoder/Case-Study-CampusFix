import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import {
  CATEGORY_OPTIONS,
  ReportCategory,
  ReportStatus,
  ReportUrgency,
  URGENCY_OPTIONS,
} from '../../models/report.model';
import { ReportService } from '../../services/report.service';

function nonBlankValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (typeof value === 'string' && value.trim().length === 0) {
    return { blank: true };
  }
  return null;
}

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.page.html',
  styleUrls: ['./create-report.page.scss'],
  standalone: false,
})
export class CreateReportPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastController = inject(ToastController);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly categoryOptions = CATEGORY_OPTIONS;
  readonly urgencyOptions = URGENCY_OPTIONS;

  readonly reportForm = this.fb.nonNullable.group({
    category: ['' as ReportCategory | '', [Validators.required]],
    title: [
      '',
      [Validators.required, nonBlankValidator, Validators.maxLength(100)],
    ],
    location: [
      '',
      [Validators.required, nonBlankValidator, Validators.maxLength(120)],
    ],
    description: [
      '',
      [Validators.required, nonBlankValidator, Validators.maxLength(500)],
    ],
    urgency: ['Standard' as ReportUrgency, [Validators.required]],
  });

  submitted = false;
  isSaving = false;
  isCapturingPhoto = false;
  activePhotoAction: 'camera' | 'gallery' | null = null;
  saveError: string | null = null;

  photoPath: string | null = null;
  photoPreviewUrl: string | null = null;
  photoFeedback: { type: 'info' | 'warning'; message: string } | null = null;

  private didSaveReport = false;

  /** Set when editing an existing report (route /create-report/:id). */
  editingId: string | null = null;
  editNotFound = false;
  private originalPhotoPath: string | null = null;

  get isEditMode(): boolean {
    return this.editingId !== null;
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot?.paramMap.get('id');
    if (!id) {
      return;
    }

    this.editingId = id;
    try {
      const report = await this.reportService.getReportById(id);
      if (!report) {
        this.editNotFound = true;
        return;
      }

      this.reportForm.setValue({
        category: report.category,
        title: report.title,
        location: report.location,
        description: report.description,
        urgency: report.urgency,
      });
      this.photoPath = report.photoPath;
      this.originalPhotoPath = report.photoPath;
      this.photoPreviewUrl = report.photoPath
        ? await this.reportService.resolvePhotoUrl(report.photoPath)
        : null;
    } catch (error) {
      console.error('CampusFix: failed to load report for editing.', error);
      this.editNotFound = true;
    } finally {
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    // Clean up a newly attached photo that was never saved.
    if (
      !this.didSaveReport &&
      this.photoPath &&
      this.photoPath !== this.originalPhotoPath
    ) {
      void this.reportService.deletePhotoFile(this.photoPath);
    }
  }

  /** Never delete the saved report's photo until the edit is saved. */
  private discardUnsavedPhoto(path: string | null): void {
    if (path && path !== this.originalPhotoPath) {
      void this.reportService.deletePhotoFile(path);
    }
  }

  get descriptionLength(): number {
    return this.reportForm.controls.description.value.length;
  }

  get selectedUrgencyTarget(): string {
    const current = this.reportForm.controls.urgency.value;
    return (
      this.urgencyOptions.find((item) => item.value === current)?.targetText ??
      ''
    );
  }

  selectCategory(category: ReportCategory): void {
    this.reportForm.controls.category.setValue(category);
    this.reportForm.controls.category.markAsTouched();
    this.reportForm.controls.category.markAsDirty();
  }

  selectUrgency(urgency: ReportUrgency): void {
    this.reportForm.controls.urgency.setValue(urgency);
  }

  hasError(
    controlName: 'category' | 'location' | 'title' | 'description'
  ): boolean {
    const control = this.reportForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty || this.submitted);
  }

  getErrorMessage(
    controlName: 'category' | 'location' | 'title' | 'description'
  ): string {
    const control = this.reportForm.controls[controlName];
    if (control.hasError('required') || control.hasError('blank')) {
      switch (controlName) {
        case 'category':
          return 'Please select an issue category.';
        case 'location':
          return 'Please enter the building, room, or campus area.';
        case 'title':
          return 'Please enter a short title for the issue.';
        case 'description':
          return 'Please describe what is damaged or needs attention.';
      }
    }
    if (control.hasError('maxlength')) {
      return 'Entered text is too long. Please shorten it.';
    }
    return 'Please check this field.';
  }

  async onTakePhoto(): Promise<void> {
    await this.acquirePhoto('camera');
  }

  async onUploadPhoto(): Promise<void> {
    await this.acquirePhoto('gallery');
  }

  async onStaticPrototypeAction(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
      cssClass: 'cf-toast-info',
    });
    await toast.present();
  }

  private async acquirePhoto(source: 'camera' | 'gallery'): Promise<void> {
    if (this.isCapturingPhoto || this.isSaving) {
      return;
    }

    this.isCapturingPhoto = true;
    this.activePhotoAction = source;
    this.photoFeedback = null;
    this.cdr.markForCheck();

    try {
      const result =
        source === 'camera'
          ? await this.reportService.captureIssuePhoto()
          : await this.reportService.pickIssuePhotoFromGallery();

      if (result.status === 'captured') {
        const previousPath = this.photoPath;
        this.photoPath = result.photoPath;
        this.photoPreviewUrl = result.previewUrl;
        if (previousPath && previousPath !== result.photoPath) {
          this.discardUnsavedPhoto(previousPath);
        }
      } else if (result.status === 'cancelled') {
        this.photoFeedback = {
          type: 'info',
          message:
            source === 'camera'
              ? 'Photo capture was cancelled. You can still save your report without a photo.'
              : 'Photo selection was cancelled. You can still save your report without a photo.',
        };
      } else {
        this.photoFeedback = {
          type: 'warning',
          message: result.message,
        };
      }
    } finally {
      this.isCapturingPhoto = false;
      this.activePhotoAction = null;
      this.cdr.markForCheck();
    }
  }

  async onRemovePhoto(): Promise<void> {
    const oldPath = this.photoPath;
    this.photoPath = null;
    this.photoPreviewUrl = null;
    this.photoFeedback = null;
    this.cdr.markForCheck();
    this.discardUnsavedPhoto(oldPath);
  }

  async onSubmit(status: ReportStatus = 'Saved locally'): Promise<void> {
    if (this.isSaving) {
      return;
    }

    this.submitted = true;
    this.saveError = null;

    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      this.saveError = 'Please complete all required fields before saving.';
      this.cdr.markForCheck();
      return;
    }

    const { category, location, title, description, urgency } =
      this.reportForm.getRawValue();
    if (!category) {
      this.saveError = 'Please select an issue category.';
      this.cdr.markForCheck();
      return;
    }

    this.isSaving = true;
    this.cdr.markForCheck();

    try {
      const input = {
        category,
        location,
        title,
        description,
        urgency,
        status,
        photoPath: this.photoPath,
      };

      let message: string;
      if (this.editingId) {
        const updated = await this.reportService.updateReport(
          this.editingId,
          input
        );
        if (!updated) {
          throw new Error('Report to update was not found.');
        }
        // The old photo was replaced or removed, so delete its file now.
        if (this.originalPhotoPath && this.originalPhotoPath !== this.photoPath) {
          await this.reportService.deletePhotoFile(this.originalPhotoPath);
        }
        message = 'Report updated.';
      } else {
        await this.reportService.createReport(input);
        message =
          status === 'Draft' ? 'Draft saved.' : 'Maintenance request submitted.';
      }

      this.didSaveReport = true;

      const toast = await this.toastController.create({
        message,
        duration: 2500,
        cssClass: 'cf-toast-success',
        position: 'bottom',
      });
      await toast.present();

      if (this.editingId) {
        await this.router.navigate(['/report-details', this.editingId], {
          replaceUrl: true,
        });
      } else {
        await this.router.navigate(['/my-reports'], { replaceUrl: true });
      }
    } catch (error) {
      console.error('CampusFix: failed to save report.', error);
      this.saveError =
        'Could not submit the maintenance request. Please try again.';
      this.isSaving = false;
      this.cdr.markForCheck();
    }
  }
}
