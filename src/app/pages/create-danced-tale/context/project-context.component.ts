import { Component, ElementRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '../../../shared/components/button/button.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import { AGE_RANGES } from '../../../models/types/age-range.type';
import { PERFORMANCE_SPACES, PerformanceSpace } from '../../../models/types/performance-space.type';
import { ProjectContextForm, SECRET_INGREDIENT_MAX_LENGTH } from './project-context.form';

type ProjectContextField = keyof ProjectContextForm['controls'];

// Suggestions provisoires en attendant un référentiel de thèmes côté backend.
const THEME_SUGGESTION_KEYS = [
  'fantasy',
  'worldTales',
  'mythsAndLegends',
  'middleAges',
  'nature',
  'animals',
  'emotions',
  'livingTogether',
  'travel',
] as const;

const PERFORMANCE_SPACE_ICONS: Record<PerformanceSpace, string> = {
  salle_spectacle: 'fa-masks-theater',
  gymnase: 'fa-basketball',
  classe: 'fa-chalkboard-user',
  exterieur: 'fa-tree',
};

@Component({
  imports: [ReactiveFormsModule, TranslatePipe, Button],
  selector: 'app-project-context',
  styleUrl: './project-context.component.scss',
  templateUrl: './project-context.component.html',
})
export class ProjectContextComponent {
  private readonly draftService = inject(CreateDancedTaleDraftService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly ageRanges = AGE_RANGES;
  protected readonly performanceSpaces = PERFORMANCE_SPACES;
  protected readonly performanceSpaceIcons = PERFORMANCE_SPACE_ICONS;
  protected readonly themeSuggestionKeys = THEME_SUGGESTION_KEYS;
  protected readonly ingredientMaxLength = SECRET_INGREDIENT_MAX_LENGTH;

  protected readonly form = new ProjectContextForm();
  protected readonly ingredientInput = new FormControl('', { nonNullable: true });
  protected readonly submitted = signal(false);

  constructor() {
    const savedContext = this.draftService.context();

    if (savedContext) {
      this.form.fromProjectContext(savedContext);
    }
  }

  protected hasError(field: ProjectContextField): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  protected onIngredientKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addIngredient();
    }
  }

  protected addIngredient(): void {
    if (this.form.addSecretIngredient(this.ingredientInput.value)) {
      this.ingredientInput.reset();
    }
  }

  protected removeIngredient(index: number): void {
    this.form.removeSecretIngredient(index);
  }

  protected onNext(): void {
    this.submitted.set(true);

    // Un mot-clé tapé sans être validé par Entrée ne doit pas être perdu.
    this.addIngredient();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    // Sauvegarde automatique au passage à l'étape suivante.
    this.draftService.saveContext(this.form.toProjectContext());
    this.router.navigate(['../discovery'], { relativeTo: this.route });
  }

  private focusFirstInvalidField(): void {
    // Après le rendu des messages d'erreur.
    setTimeout(() => {
      this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid')?.focus();
    });
  }
}
