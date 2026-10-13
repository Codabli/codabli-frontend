import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewportScroller } from '@angular/common';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should link the brand to the home route', () => {
    const brandLink = fixture.nativeElement.querySelector(
      '.header__brand',
    ) as HTMLAnchorElement;

    expect(brandLink.getAttribute('href')).toBe('/');
  });

  it('should scroll to the top when the brand is clicked', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const viewportScroller = TestBed.inject(ViewportScroller);
    const scrollToPosition = vi
      .spyOn(viewportScroller, 'scrollToPosition')
      .mockImplementation(() => {});
    const brandLink = fixture.nativeElement.querySelector(
      '.header__brand',
    ) as HTMLAnchorElement;

    brandLink.click();

    expect(scrollToPosition).toHaveBeenCalledWith([0, 0], {
      behavior: 'smooth',
    });
  });
});
