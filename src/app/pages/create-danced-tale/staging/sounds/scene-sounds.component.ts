import { Component, DestroyRef, ElementRef, effect, inject, input, output, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AudioFileStore } from '../../../../core/services/audio-file-store.service';
import {
  DANCE_MOMENTS,
  DanceMoment,
  SOUND_KINDS,
  SceneDance,
  SceneSound,
  SoundKind,
} from '../../../../models/interfaces/tale-staging.interface';
import { newId } from '../../new-id';

/** Taille maximale d'un fichier audio importé. */
export const SOUND_MAX_FILE_SIZE = 20 * 1024 * 1024;
export const SOUND_TITLE_MAX_LENGTH = 80;

export type SoundImportError = 'notAudio' | 'tooLarge' | 'storage';

/** Titre par défaut : nom du fichier sans son extension. */
function titleFromFileName(name: string): string {
  return name.replace(/\.[^.]+$/, '').slice(0, SOUND_TITLE_MAX_LENGTH);
}

/**
 * Musiques et bruitages d'une scène (écran 8.4, SCRUM-103) : import d'un fichier audio
 * par l'enseignant, lecteur, type, moment et danse accompagnée.
 */
@Component({
  imports: [TranslatePipe],
  selector: 'app-scene-sounds',
  styleUrl: './scene-sounds.component.scss',
  templateUrl: './scene-sounds.component.html',
})
export class SceneSounds {
  private readonly store = inject(AudioFileStore);
  private readonly translate = inject(TranslateService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly sceneId = input.required<string>();
  readonly sounds = input<SceneSound[]>([]);
  /** Danses de la scène, pour indiquer celle qu'un son accompagne. */
  readonly dances = input<SceneDance[]>([]);

  readonly soundsChange = output<SceneSound[]>();

  protected readonly kinds = SOUND_KINDS;
  protected readonly moments = DANCE_MOMENTS;
  protected readonly titleMaxLength = SOUND_TITLE_MAX_LENGTH;

  protected readonly importError = signal<SoundImportError | null>(null);
  /** Adresse de lecture de chaque fichier chargé. */
  protected readonly urls = signal<Record<string, string>>({});
  /** Fichiers introuvables sur cet appareil (importés depuis un autre navigateur, données effacées...). */
  protected readonly missing = signal<ReadonlySet<string>>(new Set());
  protected readonly announcement = signal('');

  private readonly objectUrls = new Set<string>();
  private readonly requested = new Set<string>();

  constructor() {
    // Charge les fichiers des sons affichés, une seule fois chacun.
    effect(() => {
      for (const sound of this.sounds()) {
        if (!this.requested.has(sound.fileId)) {
          this.requested.add(sound.fileId);
          void this.load(sound.fileId);
        }
      }
    });

    inject(DestroyRef).onDestroy(() => this.objectUrls.forEach((url) => URL.revokeObjectURL(url)));
  }

  protected fieldId(sound: SceneSound, field: string): string {
    return `sound-${sound.id}-${field}`;
  }

  /** Une danse supprimée depuis n'est plus proposée : le son n'accompagne alors aucune danse. */
  protected danceOf(sound: SceneSound): string {
    return this.dances().some((dance) => dance.id === sound.danceId) ? (sound.danceId as string) : '';
  }

  protected async onFileSelected(event: Event, replaced?: SceneSound): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Permet de choisir à nouveau le même fichier.
    input.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('audio/')) {
      this.importError.set('notAudio');
      return;
    }

    if (file.size > SOUND_MAX_FILE_SIZE) {
      this.importError.set('tooLarge');
      return;
    }

    const fileId = newId();
    this.requested.add(fileId);

    try {
      await this.store.put(fileId, file);
    } catch {
      this.importError.set('storage');
      return;
    }

    this.importError.set(null);
    this.setUrl(fileId, file);

    if (replaced) {
      this.update(replaced, { fileId, fileName: file.name });
      void this.store.delete(replaced.fileId).catch(() => undefined);
      return;
    }

    const sound: SceneSound = {
      id: newId(),
      title: titleFromFileName(file.name),
      kind: 'music',
      // Le plus courant pour une musique : une ambiance qui dure toute la scène.
      moment: 'wholeScene',
      danceId: null,
      fileId,
      fileName: file.name,
    };
    this.soundsChange.emit([...this.sounds(), sound]);
    this.announcement.set(this.translate.instant('createDancedTale.sounds.announce.added', { title: sound.title }));
    this.focus(`#${this.fieldId(sound, 'title')}`);
  }

  protected remove(sound: SceneSound): void {
    this.soundsChange.emit(this.sounds().filter((s) => s.id !== sound.id));
    void this.store.delete(sound.fileId).catch(() => undefined);
    this.announcement.set(this.translate.instant('createDancedTale.sounds.announce.removed', { title: sound.title }));
    // Le bouton supprimé disparaît : le focus revient sur l'import.
    this.focus(`#scene-${this.sceneId()}-sound-file`);
  }

  protected setTitle(sound: SceneSound, title: string): void {
    this.update(sound, { title });
  }

  protected setKind(sound: SceneSound, kind: SoundKind): void {
    this.update(sound, { kind });
  }

  protected setMoment(sound: SceneSound, moment: DanceMoment): void {
    this.update(sound, { moment });
  }

  protected setDance(sound: SceneSound, danceId: string): void {
    this.update(sound, { danceId: danceId || null });
  }

  private update(sound: SceneSound, changes: Partial<SceneSound>): void {
    this.soundsChange.emit(this.sounds().map((s) => (s.id === sound.id ? { ...s, ...changes } : s)));
  }

  private async load(fileId: string): Promise<void> {
    let blob: Blob | undefined;

    try {
      blob = await this.store.get(fileId);
    } catch {
      // Stockage indisponible : le fichier est signalé comme absent de cet appareil.
    }

    if (blob) {
      this.setUrl(fileId, blob);
    } else {
      this.missing.update((missing) => new Set(missing).add(fileId));
    }
  }

  private setUrl(fileId: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    this.objectUrls.add(url);
    this.urls.update((urls) => ({ ...urls, [fileId]: url }));
  }

  private focus(selector: string): void {
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus());
  }
}
