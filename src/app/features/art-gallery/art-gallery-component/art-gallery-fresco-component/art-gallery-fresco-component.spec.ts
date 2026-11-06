import { ComponentFixture, TestBed } from '@angular/core/testing';
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

    service.extendFresco();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-art-gallery-hotspot-component')).not.toBeNull();

    service.shrinkFresco();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-art-gallery-hotspot-component')).toBeNull();
  });
});
