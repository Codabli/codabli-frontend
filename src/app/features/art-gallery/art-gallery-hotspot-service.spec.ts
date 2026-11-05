import { TestBed } from '@angular/core/testing';
import { ArtGalleryHotspotService } from './art-gallery-hotspot-service';

describe('ArtGalleryHotspotService', () => {
  let service: ArtGalleryHotspotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtGalleryHotspotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
