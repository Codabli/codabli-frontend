import { TestBed } from '@angular/core/testing';
import { ArtGalleryService } from './art-gallery-service';

describe('ArtGalleryService', () => {
  let service: ArtGalleryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtGalleryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
