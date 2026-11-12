import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController, ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { Report, getCategoryIcon } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-report-details',
  templateUrl: './report-details.page.html',
  styleUrls: ['./report-details.page.scss'],
  standalone: false,
})
export class ReportDetailsPage implements OnInit, OnDestroy, ViewWillEnter {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reportService = inject(ReportService);
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);
  private readonly cdr = inject(ChangeDetectorRef);

  isDeleting = false;
  private currentId: string | null = null;
  private hasLoadedOnce = false;

  report: Report | null = null;
  photoUrl: string | null = null;
  photoUnavailable = false;
  isLoading = true;
  loadError: string | null = null;
  isPhotoViewerOpen = false;

  private routeSub: Subscription | null = null;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.currentId = id;
      this.hasLoadedOnce = true;
      void this.loadReport(id);
    });
  }

  /** Reload when coming back from the edit screen so changes show up. */
  ionViewWillEnter(): void {
    if (this.hasLoadedOnce && this.currentId) {
      void this.loadReport(this.currentId);
    }
  }

  async onEditReport(): Promise<void> {
    if (this.report) {
      await this.router.navigate(['/create-report', this.report.id]);
    }
  }

  async onCancelReport(): Promise<void> {
    if (!this.report || this.isDeleting) {
      return;
    }
    const alert = await this.alertController.create({
      header: 'Cancel this report?',
      message: `"${this.report.title}" and its photo will be permanently deleted.`,
      buttons: [
        { text: 'Keep Report', role: 'cancel' },
        {
          text: 'Cancel Report',
          role: 'destructive',
          handler: () => {
            void this.deleteCurrentReport();
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteCurrentReport(): Promise<void> {
    if (!this.report) {
      return;
    }
    this.isDeleting = true;
    this.cdr.markForCheck();
    try {
      await this.reportService.deleteReport(this.report.id);
      const toast = await this.toastController.create({
        message: 'Report cancelled.',
        duration: 2200,
        position: 'bottom',
        cssClass: 'cf-toast-success',
      });
      await toast.present();
      await this.router.navigate(['/my-reports'], { replaceUrl: true });
    } catch (error) {
      console.error('CampusFix: failed to delete report.', error);
      this.isDeleting = false;
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  categoryIcon(category: string): string {
    return getCategoryIcon(category);
  }

  onPhotoLoadError(): void {
    this.photoUrl = null;
    this.photoUnavailable = true;
    this.isPhotoViewerOpen = false;
    this.cdr.markForCheck();
  }

  setPhotoViewerOpen(open: boolean): void {
    this.isPhotoViewerOpen = open;
    this.cdr.markForCheck();
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

  private async loadReport(id: string | null): Promise<void> {
    this.isLoading = true;
    this.loadError = null;
    this.report = null;
    this.photoUrl = null;
    this.photoUnavailable = false;
    this.isPhotoViewerOpen = false;
    this.cdr.markForCheck();

    if (!id) {
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    try {
      const found = await this.reportService.getReportById(id);
      this.report = found;

      if (found?.photoPath) {
        const resolved = await this.reportService.resolvePhotoUrl(
          found.photoPath
        );
        if (resolved) {
          this.photoUrl = resolved;
        } else {
          this.photoUnavailable = true;
        }
      }
    } catch (error) {
      console.error('CampusFix: failed to load report details.', error);
      this.loadError = 'Unable to load this report. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}
