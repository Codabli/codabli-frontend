import { TestBed } from '@angular/core/testing';
import { ArtGalleryService } from './art-gallery-service';
import { ArtGalleryCountryEnum } from './art-gallery-country-enum';

describe('ArtGalleryService', () => {
  let service: ArtGalleryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtGalleryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('navigates directly to a visitable country and publishes the change', () => {
    const countries: ArtGalleryCountryEnum[] = [];
    service.currentCountryObservable.subscribe((country) => countries.push(country));

    service.GoTo(ArtGalleryCountryEnum.VIETNAM);

    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);
    expect(countries).toEqual([
      ArtGalleryCountryEnum.WORLD,
      ArtGalleryCountryEnum.VIETNAM,
    ]);
  });

  it('does not navigate to a country that is not visitable', () => {
    service.GoTo(ArtGalleryCountryEnum.AUSTRALIA);

    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);
  });

  it('allows returning to the world map', () => {
    service.GoTo(ArtGalleryCountryEnum.VIETNAM);
    service.GoTo(ArtGalleryCountryEnum.WORLD);

    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);
  });

  it('navigates through visitable countries and stops at the last one', () => {
    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.LEBANON);

    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);

    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);
  });
});
