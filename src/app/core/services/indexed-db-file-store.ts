const DB_NAME = 'codabli';
/** Version 2 : ajout du store des ressources de la classe (écran 4). */
const DB_VERSION = 2;

/** Un store par usage, tous dans la même base. */
export const FILE_STORES = ['audio-files', 'class-resources'] as const;
export type FileStoreName = (typeof FILE_STORES)[number];

/**
 * Fichiers importés au parcours « Créer mon conte dansé », en attendant l'envoi au back.
 *
 * Ils sont gardés dans IndexedDB : contrairement au localStorage (environ 5 Mo au total), il accepte
 * de gros fichiers. Ils restent sur cet ordinateur et ce navigateur uniquement, et disparaissent si
 * l'on vide les données du site.
 */
export abstract class IndexedDbFileStore {
  protected abstract readonly storeName: FileStoreName;

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
      const request = operation(database.transaction(this.storeName, mode).objectStore(this.storeName));
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
      // Crée les stores manquants : une base de la version 1 garde ses fichiers audio.
      request.onupgradeneeded = () => {
        for (const name of FILE_STORES) {
          if (!request.result.objectStoreNames.contains(name)) {
            request.result.createObjectStore(name);
          }
        }
      };
      request.onsuccess = () => {
        // Une autre page ouvre une version plus récente : on libère la base, elle sera rouverte.
        request.result.onversionchange = () => {
          request.result.close();
          this.database = null;
        };
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });

    // En cas d'échec (navigation privée stricte...), on retentera à la prochaine demande.
    this.database.catch(() => (this.database = null));

    return this.database;
  }
}
