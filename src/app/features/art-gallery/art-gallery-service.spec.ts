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

  it('checks country navigation', () => {
    //Au demarage du service, le pays initial est le Liban
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.LEBANON);

    //On parcourt ensuite tous les pays
    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.AUSTRALIA);

    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.ITALY);

    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.FRANCE);

    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.TOGO);

    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.BRAZIL);

    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);

    //Une fois que l'on a parcouru tous les pays, on s'assure que passer au pays suivant ne change rien
    service.GoNextCountry();
    expect(service.GetCurrentCountry()).toBe(ArtGalleryCountryEnum.VIETNAM);
  })
});
