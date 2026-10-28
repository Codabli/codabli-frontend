import { Injectable } from '@angular/core';
import { IndexedDbFileStore } from './indexed-db-file-store';

/** Documents déposés à l'écran 4 du parcours « Créer mon conte dansé » (SCRUM-89). */
@Injectable({ providedIn: 'root' })
export class ClassResourceFileStore extends IndexedDbFileStore {
  protected readonly storeName = 'class-resources';
}
