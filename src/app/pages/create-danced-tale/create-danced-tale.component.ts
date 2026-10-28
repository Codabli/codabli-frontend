import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, map } from 'rxjs';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';
import { CREATE_DANCED_TALE_STEPS, CreateDancedTaleStep } from './create-danced-tale.steps';

@Component({
  imports: [NgTemplateOutlet, RouterOutlet, RouterLink, TranslatePipe],
  selector: 'app-create-danced-tale',
  styleUrl: './create-danced-tale.component.scss',
  templateUrl: './create-danced-tale.component.html',
})
export class CreateDancedTaleComponent {
  private readonly router = inject(Router);
  private readonly draft = inject(CreateDancedTaleDraftService);

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
