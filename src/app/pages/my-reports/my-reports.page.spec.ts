import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReportService } from '../../services/report.service';
import { MyReportsPageModule } from './my-reports.module';
import { MyReportsPage } from './my-reports.page';

describe('MyReportsPage', () => {
  let component: MyReportsPage;
  let fixture: ComponentFixture<MyReportsPage>;
  let reportServiceMock: {
    getReports: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    reportServiceMock = {
      getReports: vi.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [MyReportsPageModule, RouterModule.forRoot([])],
      providers: [{ provide: ReportService, useValue: reportServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MyReportsPage);
    component = fixture.componentInstance;
  });

  it('should show empty state when no reports exist', async () => {
    await component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.reports).toEqual([]);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No reports saved yet');
  });

  it('should render saved reports in the list', async () => {
    reportServiceMock.getReports.mockResolvedValue([
      {
        id: 'rep-2',
        ticketCode: '#CF-REP2',
        category: 'Plumbing',
        location: 'Gym Locker Room',
        title: 'Leaking pipe',
        description: 'Water dripping under sink.',
        urgency: 'Standard',
        photoPath: null,
        createdAt: '2026-11-11T04:00:00.000Z',
        status: 'Saved locally',
      },
    ]);

    await component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Leaking pipe');
    expect(compiled.textContent).toContain('In Progress');
  });

  it('should filter reports by search text on title or location', async () => {
    const base = {
      description: 'd', urgency: 'Standard', photoPath: null,
      createdAt: '2026-11-11T04:00:00.000Z', status: 'Saved locally',
    };
    reportServiceMock.getReports.mockResolvedValue([
      { ...base, id: 'a', ticketCode: '#CF-A', category: 'Plumbing', title: 'Leaking pipe', location: 'Gym' },
      { ...base, id: 'b', ticketCode: '#CF-B', category: 'Electrical', title: 'Broken light', location: 'Library' },
    ]);
    await component.ngOnInit();

    component.onSearch('library');
    expect(component.filteredReports.map((r) => r.id)).toEqual(['b']);
    component.onSearch('PIPE');
    expect(component.filteredReports.map((r) => r.id)).toEqual(['a']);
    component.onSearch('');
    expect(component.filteredReports.length).toBe(2);
  });
});
