import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

let nextId = 0;

/**
 * Fenêtre modale accessible : le focus reste dans la fenêtre puis revient sur l'élément
 * qui l'a ouverte, Échap ou un clic sur le fond la ferment.
 * Le parent l'affiche avec un @if et la retire sur `closed`.
 */
@Component({
  imports: [CdkTrapFocus, TranslatePipe],
  selector: 'app-modal',
  host: { '(keydown.escape)': 'closed.emit()' },
  template: `
    <div
      class="modal-backdrop"
      aria-hidden="true"
      (click)="closed.emit()"
    ></div>

    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
      [attr.aria-labelledby]="titleId"
    >
      <header class="modal__header">
        <h2
          class="modal__title"
          [id]="titleId"
        >
          {{ heading() }}
        </h2>

        <button
          type="button"
          class="modal__close"
          [attr.aria-label]="'modal.close' | translate"
          (click)="closed.emit()"
        >
          <i
            class="fa-solid fa-xmark"
            aria-hidden="true"
          ></i>
        </button>
      </header>

      <div class="modal__body">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 1000;

      display: grid;
      place-items: center;
      padding: var(--spacing-md);
    }

    .modal-backdrop {
      position: absolute;
      inset: 0;
      background-color: rgba(16, 43, 84, 0.6);
    }

    .modal {
      position: relative;

      display: flex;
      flex-direction: column;
      width: min(100%, var(--modal-width, 760px));
      max-height: calc(100vh - 2 * var(--spacing-md));
      overflow: hidden;

      font-size: 18px;
      color: var(--color-text-primary-default);

      background-color: var(--color-bg-surface);
      border-radius: 24px;
      box-shadow: 0 16px 48px rgba(16, 43, 84, 0.3);
    }

    .modal__header {
      display: flex;
      gap: var(--spacing-md);
      align-items: flex-start;
      justify-content: space-between;
      padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
      border-bottom: 2px solid var(--color-border-light);
    }

    .modal__title {
      margin: 0;

      font-family: 'Baloo 2', sans-serif;
      font-size: var(--font-size-h5);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-h5);
      color: var(--font-color-primary);
    }

    .modal__close {
      flex-shrink: 0;
      width: 48px;
      height: 48px;

      font-size: 22px;
      color: var(--color-text-primary-default);

      cursor: pointer;
      background: none;
      border: 2px solid transparent;
      border-radius: 50%;

      &:hover {
        background-color: var(--color-bg-navigation);
      }

      &:focus-visible {
        outline: none;
        border-color: var(--color-border-primary-focus);
      }
    }

    .modal__body {
      padding: var(--spacing-lg);
      overflow-y: auto;
    }
  `,
})
export class Modal {
  readonly heading = input.required<string>();
  readonly closed = output<void>();

  protected readonly titleId = `modal-title-${nextId++}`;
}
