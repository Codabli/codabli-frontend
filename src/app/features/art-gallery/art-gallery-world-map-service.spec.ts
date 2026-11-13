import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  ArtGalleryWorldMapService,
  WORLD_MAP_ASSET_URL,
} from './art-gallery-world-map-service';

describe('ArtGalleryWorldMapService', () => {
  let service: ArtGalleryWorldMapService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ArtGalleryWorldMapService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('downloads and parses the map only once', () => {
    const maps: Document[] = [];

    service.getWorldMap().subscribe((map) => maps.push(map));
    http
      .expectOne(WORLD_MAP_ASSET_URL)
      .flush('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    service.getWorldMap().subscribe((map) => maps.push(map));

    expect(maps).toHaveLength(2);
    expect(maps[1]).toBe(maps[0]);
    expect(maps[0].documentElement.localName).toBe('svg');
  });

  it('tries again after a failed download', () => {
    const errors: unknown[] = [];

    service.getWorldMap().subscribe({ error: (error) => errors.push(error) });
    http
      .expectOne(WORLD_MAP_ASSET_URL)
      .flush('', { status: 500, statusText: 'Server Error' });
    service.getWorldMap().subscribe();

    expect(errors).toHaveLength(1);
    http
      .expectOne(WORLD_MAP_ASSET_URL)
      .flush('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  });
});
