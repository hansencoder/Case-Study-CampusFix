import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReportService } from '../../services/report.service';
import { CreateReportPageModule } from './create-report.module';
import { CreateReportPage } from './create-report.page';

describe('CreateReportPage', () => {
  let component: CreateReportPage;
  let fixture: ComponentFixture<CreateReportPage>;
  let reportServiceMock: {
    createReport: ReturnType<typeof vi.fn>;
    captureIssuePhoto: ReturnType<typeof vi.fn>;
    pickIssuePhotoFromGallery: ReturnType<typeof vi.fn>;
    deletePhotoFile: ReturnType<typeof vi.fn>;
  };
  let toastControllerMock: {
    create: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    reportServiceMock = {
      createReport: vi.fn(),
      captureIssuePhoto: vi.fn(),
      pickIssuePhotoFromGallery: vi.fn(),
      deletePhotoFile: vi.fn().mockResolvedValue(undefined),
    };
    toastControllerMock = {
      create: vi.fn().mockResolvedValue({
        present: vi.fn().mockResolvedValue(undefined),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [CreateReportPageModule, RouterModule.forRoot([])],
      providers: [
        { provide: ReportService, useValue: reportServiceMock },
        { provide: ToastController, useValue: toastControllerMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CreateReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not save when required fields are empty (TC-02)', async () => {
    await component.onSubmit();

    expect(component.submitted).toBe(true);
    expect(component.saveError).toBeTruthy();
    expect(reportServiceMock.createReport).not.toHaveBeenCalled();
  });

  it('should save a valid report without a photo and navigate to My Reports (TC-03)', async () => {
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(true);
    reportServiceMock.createReport.mockResolvedValue({
      id: 'rep-1',
      ticketCode: '#CF-REP1',
      category: 'Electrical',
      location: 'Engineering Hall 3F',
      title: 'Broken outlet',
      description: 'Wall socket near door is loose.',
      urgency: 'Urgent',
      photoPath: null,
      createdAt: '2026-11-11T03:00:00.000Z',
      status: 'Saved locally',
    });

    component.reportForm.setValue({
      category: 'Electrical',
      location: 'Engineering Hall 3F',
      title: 'Broken outlet',
      description: 'Wall socket near door is loose.',
      urgency: 'Urgent',
    });

    await component.onSubmit();

    expect(reportServiceMock.createReport).toHaveBeenCalledWith({
      category: 'Electrical',
      location: 'Engineering Hall 3F',
      title: 'Broken outlet',
      description: 'Wall socket near door is loose.',
      urgency: 'Urgent',
      status: 'Saved locally',
      photoPath: null,
    });
    expect(toastControllerMock.create).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/my-reports'], {
      replaceUrl: true,
    });
  });

  it('should attach photo preview when camera capture succeeds (TC-04)', async () => {
    reportServiceMock.captureIssuePhoto.mockResolvedValue({
      status: 'captured',
      photoPath: 'campusfix-photos/test.jpg',
      previewUrl: 'data:image/jpeg;base64,abc',
    });

    await component.onTakePhoto();

    expect(component.photoPath).toBe('campusfix-photos/test.jpg');
    expect(component.photoPreviewUrl).toBe('data:image/jpeg;base64,abc');
    expect(component.photoFeedback).toBeNull();
  });

  it('should remain usable when camera capture is cancelled or permission denied (TC-05, TC-06)', async () => {
    reportServiceMock.captureIssuePhoto.mockResolvedValue({
      status: 'cancelled',
    });
    await component.onTakePhoto();
    expect(component.photoPath).toBeNull();
    expect(component.photoFeedback?.type).toBe('info');

    reportServiceMock.captureIssuePhoto.mockResolvedValue({
      status: 'denied',
      message: 'Camera permission was denied.',
    });
    await component.onTakePhoto();
    expect(component.photoPath).toBeNull();
    expect(component.photoFeedback?.type).toBe('warning');
  });

  it('should attach uploaded gallery photo preview and handle gallery cancellation', async () => {
    reportServiceMock.pickIssuePhotoFromGallery.mockResolvedValue({
      status: 'captured',
      photoPath: 'campusfix-photos/uploaded.jpg',
      previewUrl: 'data:image/jpeg;base64,xyz',
    });

    await component.onUploadPhoto();
    expect(component.photoPath).toBe('campusfix-photos/uploaded.jpg');
    expect(component.photoPreviewUrl).toBe('data:image/jpeg;base64,xyz');

    reportServiceMock.pickIssuePhotoFromGallery.mockResolvedValue({
      status: 'cancelled',
    });
    await component.onUploadPhoto();
    expect(component.photoFeedback?.type).toBe('info');
    expect(component.photoFeedback?.message).toContain('Photo selection was cancelled');
  });
});

