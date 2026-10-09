import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { SOUND_MAX_FILE_SIZE, SceneSounds } from './scene-sounds.component';
import { AudioFileStore } from '../../../../core/services/audio-file-store.service';
import { SceneDance, SceneSound } from '../../../../models/interfaces/tale-staging.interface';

const DANCE: SceneDance = { id: 'd1', danceId: 'festiveRound', name: 'Ronde', moment: 'beginning', style: 'traditional' };
const SOUND: SceneSound = {
  id: 's1',
  title: 'Luth royal',
  kind: 'music',
  moment: 'beginning',
  danceId: null,
  fileId: 'f1',
  fileName: 'luth.mp3',
};

const flush = () => new Promise((resolve) => setTimeout(resolve));

/** Faux stockage en mémoire : jsdom n'a pas IndexedDB. */
class MemoryStore {
  readonly files = new Map<string, Blob>();
  failNextPut = false;

  put = vi.fn(async (id: string, file: Blob) => {
    if (this.failNextPut) {
      throw new Error('quota');
    }
    this.files.set(id, file);
  });
  get = vi.fn(async (id: string) => this.files.get(id));
  delete = vi.fn(async (id: string) => void this.files.delete(id));
}

describe('SceneSounds', () => {
  let fixture: ComponentFixture<SceneSounds>;
  let element: HTMLElement;
  let store: MemoryStore;
  let emitted: SceneSound[][];

  async function setup(
    sounds: SceneSound[] = [],
    dances: SceneDance[] = [DANCE],
    storedFiles: string[] = [],
  ): Promise<void> {
    store = new MemoryStore();
    storedFiles.forEach((id) => store.files.set(id, new Blob(['x'])));
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:fake'), revokeObjectURL: vi.fn() });

    await TestBed.configureTestingModule({
      imports: [SceneSounds],
      providers: [provideTranslateService(), { provide: AudioFileStore, useValue: store }],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneSounds);
    fixture.componentRef.setInput('sceneId', 'scene1');
    fixture.componentRef.setInput('sounds', sounds);
    fixture.componentRef.setInput('dances', dances);
    emitted = [];
    fixture.componentInstance.soundsChange.subscribe((value) => {
      emitted.push(value);
      fixture.componentRef.setInput('sounds', value);
    });
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function importFile(file: File): Promise<void> {
    const input = element.querySelector<HTMLInputElement>('#scene-scene1-sound-file')!;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    await flush();
    fixture.detectChanges();
  }

  function last(): SceneSound[] {
    return emitted.at(-1)!;
  }

  it('importe un fichier audio, le garde dans le navigateur et affiche le lecteur', async () => {
    await setup();

    await importFile(new File(['x'], 'Luth royal.mp3', { type: 'audio/mpeg' }));

    expect(last()).toEqual([
      expect.objectContaining({
        title: 'Luth royal',
        kind: 'music',
        moment: null,
        danceId: null,
        fileName: 'Luth royal.mp3',
      }),
    ]);
    expect(store.put).toHaveBeenCalledWith(last()[0].fileId, expect.any(File));
    expect(element.querySelector('audio')!.getAttribute('src')).toBe('blob:fake');
  });

  it('refuse un fichier qui n\'est pas audio', async () => {
    await setup();

    await importFile(new File(['x'], 'notes.txt', { type: 'text/plain' }));

    expect(emitted).toHaveLength(0);
    expect(element.querySelector('[role="alert"]')!.textContent).toContain('createDancedTale.sounds.errors.notAudio');
  });

  it('refuse un fichier de plus de 20 Mo', async () => {
    await setup();
    const file = new File(['x'], 'long.mp3', { type: 'audio/mpeg' });
    Object.defineProperty(file, 'size', { value: SOUND_MAX_FILE_SIZE + 1 });

    await importFile(file);

    expect(emitted).toHaveLength(0);
    expect(element.querySelector('[role="alert"]')!.textContent).toContain('createDancedTale.sounds.errors.tooLarge');
  });

  it('signale un fichier qui n\'a pas pu être enregistré dans le navigateur', async () => {
    await setup();
    store.failNextPut = true;

    await importFile(new File(['x'], 'son.mp3', { type: 'audio/mpeg' }));

    expect(emitted).toHaveLength(0);
    expect(element.querySelector('[role="alert"]')!.textContent).toContain('createDancedTale.sounds.errors.storage');
  });

  it('relit un fichier déjà importé, ou signale qu\'il manque sur cet appareil', async () => {
    await setup([SOUND, { ...SOUND, id: 's2', fileId: 'absent', fileName: 'orage.mp3' }], [DANCE], ['f1']);
    await flush();
    fixture.detectChanges();

    const sounds = element.querySelectorAll<HTMLElement>('li.sound');
    expect(sounds[0].querySelector('audio')!.getAttribute('src')).toBe('blob:fake');
    expect(sounds[0].querySelector('.sound__missing')).toBeNull();
    expect(sounds[1].querySelector('audio')).toBeNull();
    expect(sounds[1].querySelector('.sound__missing')!.textContent).toContain('createDancedTale.sounds.missing');
  });

  it('règle le type, le moment et la danse accompagnée', async () => {
    await setup([SOUND]);
    const sound = () => element.querySelector<HTMLElement>('li.sound')!;

    sound().querySelectorAll<HTMLInputElement>('input[type="radio"]')[1].click();
    fixture.detectChanges();
    // Moments facultatifs : début, milieu, fin.
    sound().querySelectorAll<HTMLButtonElement>('.segmented__toggle')[2].click();
    fixture.detectChanges();
    const dance = sound().querySelector<HTMLSelectElement>('select')!;
    dance.value = 'd1';
    dance.dispatchEvent(new Event('change'));

    expect(last()).toEqual([{ ...SOUND, kind: 'effect', moment: 'end', danceId: 'd1' }]);
  });

  it('ne propose plus une danse supprimée de la scène', async () => {
    await setup([{ ...SOUND, danceId: 'gone' }]);

    expect(element.querySelector<HTMLSelectElement>('li.sound select')!.value).toBe('');
  });

  it('supprime un son, son fichier, et rend le focus à l\'import', async () => {
    await setup([SOUND]);

    element.querySelector<HTMLButtonElement>('.sound__remove')!.click();
    fixture.detectChanges();
    await flush();

    expect(last()).toEqual([]);
    expect(store.delete).toHaveBeenCalledWith('f1');
    expect(document.activeElement).toBe(element.querySelector('#scene-scene1-sound-file'));
  });
});
