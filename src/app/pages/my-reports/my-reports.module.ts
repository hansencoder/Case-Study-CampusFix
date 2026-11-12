import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

import { SharedModule } from '../../shared/shared.module';
import { MyReportsPageRoutingModule } from './my-reports-routing.module';
import { MyReportsPage } from './my-reports.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    SharedModule,
    MyReportsPageRoutingModule,
  ],
  declarations: [MyReportsPage],
})
export class MyReportsPageModule {}
