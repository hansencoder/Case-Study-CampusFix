import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'create-report',
    loadChildren: () =>
      import('./pages/create-report/create-report.module').then(
        (m) => m.CreateReportPageModule
      ),
  },
  {
    path: 'my-reports',
    loadChildren: () =>
      import('./pages/my-reports/my-reports.module').then(
        (m) => m.MyReportsPageModule
      ),
  },
  {
    path: 'report-details/:id',
    loadChildren: () =>
      import('./pages/report-details/report-details.module').then(
        (m) => m.ReportDetailsPageModule
      ),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
