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

    service.goTo(ArtGalleryCountryEnum.VIETNAM);

    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);
    expect(countries).toEqual([
      ArtGalleryCountryEnum.WORLD,
      ArtGalleryCountryEnum.VIETNAM,
    ]);
  });

  it('does not navigate to a country that is not visitable', () => {
    service.goTo(ArtGalleryCountryEnum.AUSTRALIA);

    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);
  });

  it('allows returning to the world map', () => {
    service.goTo(ArtGalleryCountryEnum.VIETNAM);
    service.goTo(ArtGalleryCountryEnum.WORLD);

    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);
  });

  it('navigates through visitable countries and stops at the last one', () => {
    service.goNextCountry();
    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);

    service.goNextCountry();
    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);
  });

  it('does not navigate to Lebanon while it is not visitable', () => {
    service.goTo(ArtGalleryCountryEnum.LEBANON);

    expect(service.getCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);
  });
});
