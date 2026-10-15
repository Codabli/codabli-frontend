import { signal } from '@angular/core';

/** Délai sans modification avant la sauvegarde automatique (RG-CMC-12). */
export const AUTOSAVE_DELAY_MS = 1000;

export type AutosaveStatus = 'idle' | 'saved' | 'error';

/**
 * Sauvegarde automatique d'un écran du parcours : `schedule()` à chaque modification,
 * l'enregistrement part après `AUTOSAVE_DELAY_MS` sans nouvelle modification.
 * `save` retourne false si le brouillon n'a pas pu être écrit (stockage plein).
 */
export class Autosave {
  readonly status = signal<AutosaveStatus>('idle');
  readonly savedAt = signal<Date | null>(null);

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly save: () => boolean,
    private readonly delay = AUTOSAVE_DELAY_MS,
  ) {}

  schedule(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => this.run(), this.delay);
  }

  /** Enregistre tout de suite une modification en attente (changement d'écran, destruction). */
  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.run();
    }
  }

  private run(): void {
    this.timer = null;

    const saved = this.save();
    this.status.set(saved ? 'saved' : 'error');

    if (saved) {
      this.savedAt.set(new Date());
    }
  }
}
