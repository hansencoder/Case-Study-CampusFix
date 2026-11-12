import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReportService } from '../../services/report.service';
import { ReportDetailsPageModule } from './report-details.module';
import { ReportDetailsPage } from './report-details.page';

describe('ReportDetailsPage', () => {
  let fixture: ComponentFixture<ReportDetailsPage>;
  let reportServiceMock: {
    getReportById: ReturnType<typeof vi.fn>;
    resolvePhotoUrl: ReturnType<typeof vi.fn>;
  };

  async function setupWithId(id: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ReportDetailsPageModule, RouterModule.forRoot([])],
      providers: [
        { provide: ReportService, useValue: reportServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id })) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportDetailsPage);
    fixture.detectChanges();
    await Promise.resolve();
    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    reportServiceMock = {
      getReportById: vi.fn(),
      resolvePhotoUrl: vi.fn(),
    };
  });

  it('should display report text details and photo fallback when photo file is unavailable (TC-07, TC-09)', async () => {
    reportServiceMock.getReportById.mockResolvedValue({
      id: 'rep-9',
      ticketCode: '#CF-REP9',
      category: 'Safety Hazard',
      location: 'Cafeteria East',
      title: 'Overflowing trash bin',
      description: 'Needs emptying near the exit.',
      urgency: 'Standard',
      photoPath: 'campusfix-photos/missing.jpg',
      createdAt: '2026-11-11T05:00:00.000Z',
      status: 'Saved locally',
    });
    reportServiceMock.resolvePhotoUrl.mockResolvedValue(null);

    await setupWithId('rep-9');

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Overflowing trash bin');
    expect(text).toContain('Cafeteria East');
    expect(text).toContain('In Progress');
    expect(text).toContain('photo file is unavailable');
  });

  it('should show not found message for an unknown report ID', async () => {
    reportServiceMock.getReportById.mockResolvedValue(null);

    await setupWithId('unknown-id');

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Report not found');
  });
});
