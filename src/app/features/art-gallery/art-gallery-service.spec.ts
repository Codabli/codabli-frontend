import { TestBed } from '@angular/core/testing';
import { ArtGalleryService } from './art-gallery-service';
import {ArtGalleryCountryEnum} from './art-gallery-country-enum';

describe('ArtGalleryService', () => {
  let service: ArtGalleryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtGalleryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.todo('navigates directly to a selected country and publishes the change');

  it('checks country navigation', () => {
    //Au demarage du service, le pays initial est le Liban
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.WORLD);

    //Les pays visitables sont le Liban puis le Vietnam

    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);

    //Une fois la dernière salle atteinte, passer à la suivante ne change rien
    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);
  })
});
