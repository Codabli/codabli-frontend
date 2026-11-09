import { TestBed } from '@angular/core/testing';
import { ArtGalleryHotspotHttpService } from './art-gallery-hotspot-http-service';

describe('ArtGalleryHotspotHttpService', () => {
  let service: ArtGalleryHotspotHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtGalleryHotspotHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
