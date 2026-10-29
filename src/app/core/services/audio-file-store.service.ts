import { Injectable } from '@angular/core';
import { IndexedDbFileStore } from './indexed-db-file-store';

/** Fichiers audio importés au parcours « Créer mon conte dansé » (écran 8.4, SCRUM-103). */
@Injectable({ providedIn: 'root' })
export class AudioFileStore extends IndexedDbFileStore {
  protected readonly storeName = 'audio-files';
}
