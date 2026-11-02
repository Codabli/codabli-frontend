import { Injectable } from '@angular/core';
import { IndexedDbFileStore } from './indexed-db-file-store';

/** Images des cartes de l'univers du parcours « Créer mon conte dansé » (écran 5, SCRUM-90). */
@Injectable({ providedIn: 'root' })
export class UniverseImageStore extends IndexedDbFileStore {
  protected readonly storeName = 'universe-images';
}
