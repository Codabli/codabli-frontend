import { TestBed } from '@angular/core/testing';
import { AudioFileStore } from './audio-file-store.service';
import { ClassResourceFileStore } from './class-resource-file-store.service';

/** IndexedDB minimal en mémoire (jsdom n'en fournit pas) : une base, des stores clé → valeur. */
function fakeIndexedDb(initial: { version: number; stores: Record<string, Map<string, unknown>> }) {
  const database = {
    version: initial.version,
    stores: initial.stores,
    objectStoreNames: { contains: (name: string) => name in database.stores },
    createObjectStore: (name: string) => (database.stores[name] = new Map()),
    onversionchange: null as (() => void) | null,
    close: () => undefined,
    transaction: (name: string) => ({
      objectStore: () => {
        const store = database.stores[name];
        if (!store) {
          throw new Error(`Store inconnu : ${name}`);
        }
        const respond = (result: unknown) => {
          const request = { result, onsuccess: null as (() => void) | null, onerror: null };
          setTimeout(() => request.onsuccess?.());
          return request;
        };
        return {
          put: (value: unknown, key: string) => respond(store.set(key, value) && key),
          get: (key: string) => respond(store.get(key)),
          delete: (key: string) => respond(store.delete(key) && undefined),
        };
      },
    }),
  };

  const open = vi.fn((_name: string, version: number) => {
    const request = {
      result: database,
      onupgradeneeded: null as (() => void) | null,
      onsuccess: null as (() => void) | null,
      onerror: null,
    };
    setTimeout(() => {
      if (version > database.version) {
        database.version = version;
        request.onupgradeneeded?.();
      }
      request.onsuccess?.();
    });
    return request;
  });

  return { database, open };
}

describe('stockage des fichiers dans IndexedDB', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('garde les fichiers audio d\'une base de la version 1 et ajoute les stores manquants', async () => {
    const audio = new Map<string, unknown>([['son-1', 'musique']]);
    const fake = fakeIndexedDb({ version: 1, stores: { 'audio-files': audio } });
    vi.stubGlobal('indexedDB', { open: fake.open });

    const classResources = TestBed.inject(ClassResourceFileStore);
    await classResources.put('doc-1', new Blob(['dessin']));

    expect(fake.open).toHaveBeenCalledWith('codabli', 3);
    expect(Object.keys(fake.database.stores)).toEqual(['audio-files', 'class-resources', 'universe-images']);
    expect(await TestBed.inject(AudioFileStore).get('son-1')).toBe('musique');
    expect(await classResources.get('doc-1')).toBeInstanceOf(Blob);
    expect(await classResources.get('son-1')).toBeUndefined();
  });

  it('supprime un fichier', async () => {
    const fake = fakeIndexedDb({ version: 0, stores: {} });
    vi.stubGlobal('indexedDB', { open: fake.open });
    const store = TestBed.inject(ClassResourceFileStore);

    await store.put('doc-1', new Blob(['dessin']));
    await store.delete('doc-1');

    expect(await store.get('doc-1')).toBeUndefined();
  });

  it('échoue proprement sans IndexedDB, puis réessaie à la demande suivante', async () => {
    vi.stubGlobal('indexedDB', undefined);
    const store = TestBed.inject(ClassResourceFileStore);

    await expect(store.get('doc-1')).rejects.toThrow('IndexedDB indisponible');

    const fake = fakeIndexedDb({ version: 0, stores: {} });
    vi.stubGlobal('indexedDB', { open: fake.open });
    await expect(store.get('doc-1')).resolves.toBeUndefined();
  });
});
