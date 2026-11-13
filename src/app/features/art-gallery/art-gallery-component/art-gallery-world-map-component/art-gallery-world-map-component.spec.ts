import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryWorldMapComponent } from './art-gallery-world-map-component';
import { ArtGalleryService } from '../../art-gallery-service';
import { ArtGalleryCountryEnum } from '../../art-gallery-country-enum';
import { provideTranslateService } from '@ngx-translate/core';

describe('ArtGalleryWorldMapComponent', () => {
  let component: ArtGalleryWorldMapComponent;
  let fixture: ComponentFixture<ArtGalleryWorldMapComponent>;
  let service: ArtGalleryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryWorldMapComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryWorldMapComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ArtGalleryService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates only when a visitable country on the map is activated', () => {
    const svgDocument = new DOMParser().parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg"><g id="country-VN"></g><g id="country-FR"></g></svg>',
      'image/svg+xml',
    );

    component.onMapLoad(svgDocument);

    svgDocument
      .getElementById('country-FR')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);

    svgDocument
      .getElementById('country-VN')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);
  });

  it('activates visitable countries with the keyboard', () => {
    const svgDocument = new DOMParser().parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg"><g id="country-VN"></g></svg>',
      'image/svg+xml',
    );

    component.onMapLoad(svgDocument);
    svgDocument
      .getElementById('country-VN')
      ?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );

    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);
  });

  it('reports an error if a visitable country is missing from the SVG', () => {
    const svgDocument = new DOMParser().parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
      'image/svg+xml',
    );
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    component.onMapLoad(svgDocument);

    expect(component.mapLoadError).toBe(true);
    expect(error).toHaveBeenCalledOnce();
    error.mockRestore();
  });
});
