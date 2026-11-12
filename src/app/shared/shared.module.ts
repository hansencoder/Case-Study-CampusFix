import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

import { BottomNavComponent } from './bottom-nav/bottom-nav.component';
import { BrandHeaderComponent } from './brand-header/brand-header.component';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule],
  declarations: [BottomNavComponent, BrandHeaderComponent],
  exports: [BottomNavComponent, BrandHeaderComponent],
})
export class SharedModule {}
