import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Autosave } from './autosave';

/** Indicateur de sauvegarde automatique (« Sauvegardé à 14h32 », RG-CMC-12). */
@Component({
  imports: [TranslatePipe],
  selector: 'app-autosave-status',
  template: `
    <p
      class="autosave"
      role="status"
      [class.autosave--error]="autosave().status() === 'error'"
    >
      @switch (autosave().status()) {
        @case ('saved') {
          @if (autosave().savedAt(); as date) {
            <i
              class="fa-solid fa-cloud-arrow-up"
              aria-hidden="true"
            ></i>
            {{ 'createDancedTale.autosave.saved' | translate: { hours: twoDigits(date.getHours()), minutes: twoDigits(date.getMinutes()) } }}
          }
        }
        @case ('error') {
          <i
            class="fa-solid fa-triangle-exclamation"
            aria-hidden="true"
          ></i>
          {{ 'createDancedTale.autosave.error' | translate }}
        }
        @default {
          {{ idleKey() | translate }}
        }
      }
    </p>
  `,
  styles: `
    .autosave {
      margin: 0;
      font-size: var(--font-size-body);
      color: var(--color-text-muted);
    }

    .autosave--error {
      font-weight: var(--font-weight-bold);
      color: var(--color-text-outline-default);
    }
  `,
})
export class AutosaveStatus {
  readonly autosave = input.required<Autosave>();
  /** Message affiché avant la première sauvegarde. */
  readonly idleKey = input.required<string>();

  protected twoDigits(value: number): string {
    return String(value).padStart(2, '0');
  }
}
