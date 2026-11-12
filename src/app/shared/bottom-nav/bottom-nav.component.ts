import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: false,
})
export class BottomNavComponent {
  private readonly router = inject(Router);

  get isReportsSectionActive(): boolean {
    return (
      this.router.url.startsWith('/my-reports') ||
      this.router.url.startsWith('/report-details')
    );
  }
}

