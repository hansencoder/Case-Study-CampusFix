import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { SharedModule } from '../shared.module';
import { BottomNavComponent } from './bottom-nav.component';

describe('BottomNavComponent', () => {
  let component: BottomNavComponent;
  let fixture: ComponentFixture<BottomNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render Home, Report Issue, and My Reports navigation links', () => {
    expect(component).toBeTruthy();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Home');
    expect(text).toContain('Report Issue');
    expect(text).toContain('My Reports');
  });
});

