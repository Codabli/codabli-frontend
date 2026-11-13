import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ArtGalleryHotspotService } from '../../art-gallery-hotspot-service';
import { ArtGalleryHotspotComponent } from './art-gallery-hotspot-component';

describe('ArtGalleryHotspotComponent', () => {
  let component: ArtGalleryHotspotComponent;
  let fixture: ComponentFixture<ArtGalleryHotspotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryHotspotComponent],
      providers: [
        provideTranslateService(),
        // Hotspot data comes from json-server; tests must not depend on it.
        {
          provide: ArtGalleryHotspotService,
          useValue: { getHotspot: () => Promise.resolve(undefined) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryHotspotComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 1);
    fixture.componentRef.setInput('positionLeft', 25);
    fixture.componentRef.setInput('positionTop', 60);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.todo('places an accessible button at the configured position');
  it.todo('shows the hotspot information when clicked');
});
