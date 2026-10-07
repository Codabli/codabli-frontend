import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Écran d'attente pour les étapes du parcours pas encore développées (SCRUM-87 et suivants).
 */
@Component({
  imports: [RouterLink, TranslatePipe],
  selector: 'app-step-coming-soon',
  template: `
    <div class="coming-soon">
      <p>{{ 'createDancedTale.comingSoon.message' | translate }}</p>
      <a routerLink="../context">{{ 'createDancedTale.comingSoon.back' | translate }}</a>
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

    a {
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary-default);
    }
  `,
})
export class StepComingSoonComponent {}
