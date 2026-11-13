import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';

export const WORLD_MAP_ASSET_URL = '/assets/images/art-gallery/World_map_svgo.svg';

/**
 * Loads the world map SVG once per session: the map component is recreated
 * each time the visitor comes back from a room, and must not download and
 * parse the 800 KB map again.
 */
@Injectable({
  providedIn: 'root',
})
export class ArtGalleryWorldMapService {
  private readonly http = inject(HttpClient);
  private worldMap$: Observable<Document> | null = null;

  /**
   * The parsed map, shared by every subscriber. Consumers must import a copy
   * of it (document.importNode) and never change it. A failed load is not
   * cached, so the next call tries again.
   */
  getWorldMap(): Observable<Document> {
    this.worldMap$ ??= this.http
      .get(WORLD_MAP_ASSET_URL, { responseType: 'text' })
      .pipe(
        map((svgText) =>
          new DOMParser().parseFromString(svgText, 'image/svg+xml'),
        ),
        catchError((error: unknown) => {
          this.worldMap$ = null;
          return throwError(() => error);
        }),
        shareReplay(1),
      );
    return this.worldMap$;
  }
}
