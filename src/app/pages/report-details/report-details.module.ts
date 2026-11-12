import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

import { SharedModule } from '../../shared/shared.module';
import { ReportDetailsPageRoutingModule } from './report-details-routing.module';
import { ReportDetailsPage } from './report-details.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    SharedModule,
    ReportDetailsPageRoutingModule,
  ],
  declarations: [ReportDetailsPage],
})
export class ReportDetailsPageModule {}
