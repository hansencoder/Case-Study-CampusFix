import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReportService } from '../services/report.service';
import { HomePageModule } from './home.module';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageModule, RouterModule.forRoot([])],
      providers: [
        {
          provide: ReportService,
          useValue: {
            getReports: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and show CampusFix actions (TC-01)', () => {
    expect(component).toBeTruthy();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('CampusFix');
    expect(text).toContain('Report an Issue');
    expect(text).toContain('My Reports');
    expect(text).toContain('Instant Dispatch');
  });
});
