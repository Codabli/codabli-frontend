import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, map } from 'rxjs';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CREATE_DANCED_TALE_STEPS, CreateDancedTaleStep } from './create-danced-tale.steps';

@Component({
  imports: [NgTemplateOutlet, RouterOutlet, RouterLink, TranslatePipe, ButtonComponent],
  selector: 'app-create-danced-tale',
  styleUrl: './create-danced-tale.component.scss',
  templateUrl: './create-danced-tale.component.html',
})
export class CreateDancedTaleComponent {
  private readonly router = inject(Router);
  protected readonly draft = inject(CreateDancedTaleDraftService);
  protected readonly retrying = signal(false);

  protected readonly steps = CREATE_DANCED_TALE_STEPS;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentIndex = computed(() => {
    const segments = this.url().split(/[/?#]/);
    return Math.max(
      this.steps.findIndex((step) => segments.includes(step.path)),
      0,
    );
  });

  protected readonly isWide = computed(() => !!this.steps[this.currentIndex()].wide);

  /** Les écrans d'un conte sont sous son identifiant : `/create-danced-tale/{id}/{étape}`. */
  protected stepLink(step: CreateDancedTaleStep): string[] {
    return ['/create-danced-tale', this.draft.taleId() ?? '', step.path];
  }

  protected async retry(): Promise<void> {
    this.retrying.set(true);
    await this.draft.retryFailedSaves();
    this.retrying.set(false);
  }

  /** Une étape de la frise est cliquable dès que le brouillon permet de l'ouvrir. */
  protected isReachable(step: CreateDancedTaleStep): boolean {
    switch (step.requires) {
      case 'context':
        return !!this.draft.context();
      case 'structure':
        return !!this.draft.context() && !!this.draft.structure()?.steps?.length;
      default:
        return true;
    }
  }
}
