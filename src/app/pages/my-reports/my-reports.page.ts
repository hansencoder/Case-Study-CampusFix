import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ToastController, ViewWillEnter } from '@ionic/angular';

import { Report } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

export type ReportFilter = 'all' | 'saved' | 'draft' | 'urgent';

@Component({
  selector: 'app-my-reports',
  templateUrl: './my-reports.page.html',
  styleUrls: ['./my-reports.page.scss'],
  standalone: false,
})
export class MyReportsPage implements OnInit, ViewWillEnter {
  private readonly reportService = inject(ReportService);
  private readonly toastController = inject(ToastController);
  private readonly cdr = inject(ChangeDetectorRef);

  reports: Report[] = [];
  activeFilter: ReportFilter = 'all';
  isLoading = true;
  loadError: string | null = null;

  get savedCount(): number {
    return this.reports.filter((r) => r.status === 'Saved locally').length;
  }

  get draftCount(): number {
    return this.reports.filter((r) => r.status === 'Draft').length;
  }

  get urgentCount(): number {
    return this.reports.filter((r) => r.urgency === 'Urgent').length;
  }

  searchQuery = '';

  get filteredReports(): Report[] {
    const query = this.searchQuery.trim().toLowerCase();
    const byFilter = this.applyFilter();
    if (!query) {
      return byFilter;
    }
    return byFilter.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query) ||
        r.ticketCode.toLowerCase().includes(query)
    );
  }

  onSearch(value: string | null | undefined): void {
    this.searchQuery = value ?? '';
    this.cdr.markForCheck();
  }

  private applyFilter(): Report[] {
    switch (this.activeFilter) {
      case 'saved':
        return this.reports.filter((r) => r.status === 'Saved locally');
      case 'draft':
        return this.reports.filter((r) => r.status === 'Draft');
      case 'urgent':
        return this.reports.filter((r) => r.urgency === 'Urgent');
      default:
        return this.reports;
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadReports();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadReports();
  }

  setFilter(filter: ReportFilter): void {
    this.activeFilter = filter;
  }

  async onStaticEmergencyTap(): Promise<void> {
    const toast = await this.toastController.create({
      message: '24/7 Operations Desk: (555) 019-4321',
      duration: 2200,
      position: 'bottom',
      cssClass: 'cf-toast-info',
    });
    await toast.present();
  }

  async loadReports(): Promise<void> {
    this.isLoading = true;
    this.loadError = null;
    this.cdr.markForCheck();

    try {
      this.reports = await this.reportService.getReports();
    } catch (error) {
      console.error('CampusFix: failed to load reports.', error);
      this.loadError = 'Could not load maintenance reports. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}
