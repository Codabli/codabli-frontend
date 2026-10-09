import { Injectable } from '@angular/core';

const DB_NAME = 'codabli';
const DB_VERSION = 1;
const STORE = 'audio-files';

/**
 * Fichiers audio importés au parcours « Créer mon conte dansé » (écran 8.4, SCRUM-103).
 *
 * En attendant l'envoi au back, les fichiers sont gardés dans IndexedDB : contrairement au
 * localStorage (environ 5 Mo au total), il accepte de gros fichiers. Ils restent sur cet
 * ordinateur et ce navigateur uniquement, et disparaissent si l'on vide les données du site.
 */
@Injectable({ providedIn: 'root' })
export class AudioFileStore {
  private database: Promise<IDBDatabase> | null = null;

  /** Enregistre le fichier sous l'identifiant donné. */
  async put(id: string, file: Blob): Promise<void> {
    await this.request('readwrite', (store) => store.put(file, id));
  }

  /** Le fichier, ou undefined s'il n'est pas sur cet appareil. */
  async get(id: string): Promise<Blob | undefined> {
    return this.request<Blob | undefined>('readonly', (store) => store.get(id));
  }

  async delete(id: string): Promise<void> {
    await this.request('readwrite', (store) => store.delete(id));
  }

  private async request<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest): Promise<T> {
    const database = await this.open();

    return new Promise<T>((resolve, reject) => {
      const request = operation(database.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  private open(): Promise<IDBDatabase> {
    this.database ??= new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB indisponible'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // En cas d'échec (navigation privée stricte...), on retentera à la prochaine demande.
    this.database.catch(() => (this.database = null));

    return this.database;
  }
}
