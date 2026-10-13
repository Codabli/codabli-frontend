import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CREATE_DANCED_TALE_STEPS } from '../create-danced-tale.steps';

/**
 * Écran d'attente pour les étapes du parcours pas encore développées.
 * La route indique les étapes voisines à proposer (`data.previousStep`, `data.nextStep`).
 */
@Component({
  imports: [RouterLink, TranslatePipe],
  selector: 'app-step-coming-soon',
  template: `
    <div class="coming-soon">
      <p>{{ 'createDancedTale.comingSoon.message' | translate }}</p>

      <div class="coming-soon__links">
        @if (previousStep; as step) {
          <a [routerLink]="'../' + step.path">
            {{ 'createDancedTale.comingSoon.back' | translate: { step: (step.labelKey | translate) } }}
          </a>
        }

        @if (nextStep; as step) {
          <a [routerLink]="'../' + step.path">
            {{ 'createDancedTale.comingSoon.next' | translate: { step: (step.labelKey | translate) } }}
          </a>
        }
      </div>
    </div>
  `,
  styles: `
    .coming-soon {
      padding: var(--spacing-2xl) var(--spacing-lg);
      font-size: 18px;
      text-align: center;
      background-color: var(--color-bg-navigation);
      border-radius: 24px;
    }

    .coming-soon__links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--spacing-lg);
    }

    a {
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary-default);
    }
  `,
})
export class StepComingSoonComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;

  protected readonly previousStep = this.findStep(this.data['previousStep']);
  protected readonly nextStep = this.findStep(this.data['nextStep']);

  private findStep(path: string | undefined) {
    return CREATE_DANCED_TALE_STEPS.find((step) => step.path === path);
  }
}
