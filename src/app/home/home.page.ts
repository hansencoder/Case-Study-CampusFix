import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ToastController, ViewWillEnter } from '@ionic/angular';

import { Report, getCategoryIcon } from '../models/report.model';
import { ReportService } from '../services/report.service';

export interface HomeRecentReport {
  report: Report;
  thumbnailUrl: string | null;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, ViewWillEnter {
  private readonly reportService = inject(ReportService);
  private readonly toastController = inject(ToastController);
  private readonly cdr = inject(ChangeDetectorRef);

  savedCount = 0;
  withPhotoCount = 0;
  urgentCount = 0;
  recentReports: HomeRecentReport[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadSummary();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadSummary();
  }

  categoryIcon(category: string): string {
    return getCategoryIcon(category);
  }

  async onStaticFeatureTap(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
      cssClass: 'cf-toast-info',
    });
    await toast.present();
  }

  private async loadSummary(): Promise<void> {
    try {
      const reports = await this.reportService.getReports();
      this.savedCount = reports.length;
      this.withPhotoCount = reports.filter((r) => Boolean(r.photoPath)).length;
      this.urgentCount = reports.filter((r) => r.urgency === 'Urgent').length;

      const topReports = reports.slice(0, 2);
      const resolved = await Promise.all(
        topReports.map(async (report) => ({
          report,
          thumbnailUrl: report.photoPath
            ? await this.reportService.resolvePhotoUrl(report.photoPath)
            : null,
        }))
      );
      this.recentReports = resolved;
    } catch {
      this.savedCount = 0;
      this.withPhotoCount = 0;
      this.urgentCount = 0;
      this.recentReports = [];
    } finally {
      this.cdr.markForCheck();
    }
  }
}
