import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateReportPage } from './create-report.page';

const routes: Routes = [
  {
    path: '',
    component: CreateReportPage,
  },
  {
    path: ':id',
    component: CreateReportPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateReportPageRoutingModule {}

