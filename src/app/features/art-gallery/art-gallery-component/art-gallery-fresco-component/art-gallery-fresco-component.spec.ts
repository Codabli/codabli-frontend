import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ArtGalleryHotspotService } from '../../art-gallery-hotspot-service';
import { ArtGalleryFrescoComponent } from './art-gallery-fresco-component';
import { ArtGalleryService } from '../../art-gallery-service';
import { ArtGalleryCountryEnum } from '../../art-gallery-country-enum';

describe('ArtGalleryFrescoComponent', () => {
  let component: ArtGalleryFrescoComponent;
  let fixture: ComponentFixture<ArtGalleryFrescoComponent>;
  let service: ArtGalleryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryFrescoComponent],
      providers: [
        provideTranslateService(),
        // Hotspot data comes from json-server; tests must not depend on it.
        {
          provide: ArtGalleryHotspotService,
          useValue: { getHotspot: () => Promise.resolve(undefined) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryFrescoComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ArtGalleryService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows hotspots only when the fresco is extended', () => {
    service.goTo(ArtGalleryCountryEnum.VIETNAM);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-art-gallery-hotspot-component')).toBeNull();
    const canvas = fixture.nativeElement.querySelector('.fresco-canvas');
    expect(canvas.classList.contains('fresco-canvas--extended')).toBe(false);

    service.extendFresco();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-art-gallery-hotspot-component')).not.toBeNull();
    expect(canvas.classList.contains('fresco-canvas--extended')).toBe(true);

    service.shrinkFresco();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-art-gallery-hotspot-component')).toBeNull();
    expect(canvas.classList.contains('fresco-canvas--extended')).toBe(false);
  });
});
