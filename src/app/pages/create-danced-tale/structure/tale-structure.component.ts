import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { Button } from '../../../shared/components/button/button.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import {
  DEFAULT_STORY_STEPS,
  StoryStepKind,
  YOUNG_CHILDREN_STORY_STEPS,
} from '../../../models/interfaces/tale-structure.interface';
import {
  STEP_SUMMARY_MAX_LENGTH,
  STEP_TITLE_MAX_LENGTH,
  StoryStepForm,
  TaleStructureForm,
} from './tale-structure.form';

const kindKey = (kind: StoryStepKind) => `createDancedTale.structure.kinds.${kind}`;

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    Button,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
  ],
  selector: 'app-tale-structure',
  styleUrl: './tale-structure.component.scss',
  templateUrl: './tale-structure.component.html',
})
export class TaleStructureComponent {
  private readonly draftService = inject(CreateDancedTaleDraftService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly titleMaxLength = STEP_TITLE_MAX_LENGTH;
  protected readonly summaryMaxLength = STEP_SUMMARY_MAX_LENGTH;
  protected readonly kindKey = kindKey;

  protected readonly theme = this.draftService.context()?.theme ?? '';
  protected readonly characters = this.draftService.universe()?.characters ?? [];

  protected readonly form = new TaleStructureForm();
  protected readonly ready = signal(false);
  protected readonly submitted = signal(false);
  /** Étapes essentielles vides signalées : un second clic sur « Étape suivante » confirme. */
  protected readonly emptyStepsAlert = signal(false);
  protected readonly storageFull = signal(false);
  /** Message lu par les lecteurs d'écran après un déplacement ou une suppression. */
  protected readonly announcement = signal('');

  constructor() {
    const savedStructure = this.draftService.structure();

    if (savedStructure) {
      this.form.fromTaleStructure(
        savedStructure,
        this.characters.map((character) => character.id),
      );
      this.ready.set(true);
      return;
    }

    // RG-CMC-09 : 5 étapes par défaut, 3 pour les 3-5 ans.
    const kinds =
      this.draftService.context()?.ageRange === '3-5' ? YOUNG_CHILDREN_STORY_STEPS : DEFAULT_STORY_STEPS;
    const titleKeys = kinds.map((kind) => `${kindKey(kind)}.title`);

    // Attend le chargement des traductions : les titres par défaut sont modifiables.
    this.translate
      .get(titleKeys)
      .pipe(take(1), takeUntilDestroyed())
      .subscribe((titles: Record<string, string>) => {
        this.form.fromDefaults(
          kinds,
          Object.fromEntries(kinds.map((kind, i) => [kind, titles[titleKeys[i]]])),
        );
        this.ready.set(true);
      });
  }

  protected fieldId(step: StoryStepForm, field: string): string {
    return `step-${step.controls.id.value}-${field}`;
  }

  protected hasTitleError(step: StoryStepForm): boolean {
    const title = step.controls.title;
    return title.invalid && (title.touched || this.submitted());
  }

  protected showEmptyWarning(step: StoryStepForm): boolean {
    return step.isEmptyEssential && (step.controls.summary.touched || this.emptyStepsAlert());
  }

  protected summaryDescribedBy(step: StoryStepForm): string {
    const ids = step.isEssential ? [this.fieldId(step, 'hint')] : [];

    if (this.showEmptyWarning(step)) {
      ids.push(this.fieldId(step, 'warning'));
    }

    return ids.join(' ') || '';
  }

  /** Nom de l'étape pour les libellés accessibles (titre saisi, sinon son numéro). */
  protected stepName(step: StoryStepForm, index: number): string {
    return (
      step.controls.title.value.trim() ||
      this.translate.instant('createDancedTale.structure.step.number', { number: index + 1 })
    );
  }

  protected onDrop(event: CdkDragDrop<StoryStepForm[]>): void {
    this.move(event.previousIndex, event.currentIndex);
  }

  protected moveUp(index: number): void {
    this.move(index, index - 1, 'up');
  }

  protected moveDown(index: number): void {
    this.move(index, index + 1, 'down');
  }

  protected addStep(): void {
    const step = this.form.addStep();
    this.focus(`#${this.fieldId(step, 'title')}`);
  }

  protected removeStep(index: number): void {
    const name = this.stepName(this.form.steps[index], index);
    this.form.removeStep(index);
    this.announce('createDancedTale.structure.announce.removed', { step: name });

    // Le bouton supprimé disparaît : le focus va sur l'étape qui a pris sa place, sinon sur l'ajout.
    const next = this.form.steps[index];
    this.focus(next ? `#${this.fieldId(next, 'title')}` : '#add-step');
  }

  protected onPrevious(): void {
    // Le brouillon garde une saisie incomplète : rien n'est perdu en revenant en arrière.
    this.draftService.saveStructure(this.form.toTaleStructure());
    this.router.navigate(['../universe'], { relativeTo: this.route });
  }

  protected onNext(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focus('input.ng-invalid');
      return;
    }

    // Alerte de cohérence : signalée une fois, sans bloquer la suite du parcours.
    if (this.form.emptyEssentialSteps().length && !this.emptyStepsAlert()) {
      this.emptyStepsAlert.set(true);
      this.focus('#empty-steps-alert');
      return;
    }

    this.saveAndContinue();
  }

  protected saveAndContinue(): void {
    if (!this.draftService.saveStructure(this.form.toTaleStructure())) {
      this.storageFull.set(true);
      this.focus('#storage-error');
      return;
    }

    this.storageFull.set(false);
    this.router.navigate(['../writing'], { relativeTo: this.route });
  }

  private move(from: number, to: number, button?: 'up' | 'down'): void {
    const step = this.form.steps[from];

    if (!step || to < 0 || to >= this.form.steps.length || from === to) {
      return;
    }

    this.form.moveStep(from, to);
    this.announce('createDancedTale.structure.announce.moved', {
      step: this.stepName(step, to),
      position: to + 1,
      total: this.form.steps.length,
    });

    if (button) {
      // Garde le focus sur le bouton utilisé, ou sur l'autre s'il devient désactivé.
      const atEdge = button === 'up' ? to === 0 : to === this.form.steps.length - 1;
      const target = atEdge ? (button === 'up' ? 'down' : 'up') : button;
      this.focus(`#${this.fieldId(step, target)}`);
    }
  }

  private announce(key: string, params: Record<string, unknown>): void {
    this.announcement.set(this.translate.instant(key, params));
  }

  private focus(selector: string): void {
    // Après le rendu (nouvelle étape, réordonnancement, messages).
    setTimeout(() => {
      this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus();
    });
  }
}
