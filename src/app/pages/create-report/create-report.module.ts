import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';

import { SharedModule } from '../../shared/shared.module';
import { CreateReportPageRoutingModule } from './create-report-routing.module';
import { CreateReportPage } from './create-report.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    CreateReportPageRoutingModule,
  ],
  declarations: [CreateReportPage],
})
export class CreateReportPageModule {}
