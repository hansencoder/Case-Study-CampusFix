import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-brand-header',
  templateUrl: './brand-header.component.html',
  styleUrls: ['./brand-header.component.scss'],
  standalone: false,
})
export class BrandHeaderComponent {
  @Input() title = 'CampusFix';
  @Input() showBack = false;
  @Input() defaultHref = '/home';
  @Input() showBrandLogo = true;
}

