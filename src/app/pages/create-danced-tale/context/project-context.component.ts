import { Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '../../../shared/components/button/button.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import type { ApiError, ApiErrorKind } from '../../../models/interfaces/api-error.interface';
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

const SAVE_ERROR_KEYS: Partial<Record<ApiErrorKind, string>> = {
  unauthorized: 'createDancedTale.context.saveError.unauthorized',
  forbidden: 'createDancedTale.context.saveError.forbidden',
  'bad-request': 'createDancedTale.context.saveError.badRequest',
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
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ageRanges = AGE_RANGES;
  protected readonly performanceSpaces = PERFORMANCE_SPACES;
  protected readonly performanceSpaceIcons = PERFORMANCE_SPACE_ICONS;
  protected readonly themeSuggestionKeys = THEME_SUGGESTION_KEYS;
  protected readonly ingredientMaxLength = SECRET_INGREDIENT_MAX_LENGTH;

  protected readonly form = new ProjectContextForm();
  protected readonly ingredientInput = new FormControl('', { nonNullable: true });
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveErrorKey = signal<string | null>(null);

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
    if (this.saving()) {
      return;
    }

    this.submitted.set(true);
    this.saveErrorKey.set(null);

    // Un mot-clé tapé sans être validé par Entrée ne doit pas être perdu.
    this.addIngredient();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    // Sauvegarde automatique au passage à l'étape suivante.
    this.saving.set(true);
    this.draftService
      .saveContext(this.form.toProjectContext())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['../discovery'], { relativeTo: this.route });
        },
        error: (error: ApiError) => {
          this.saving.set(false);
          this.saveErrorKey.set(SAVE_ERROR_KEYS[error.kind] ?? 'createDancedTale.context.saveError.default');
        },
      });
  }

  private focusFirstInvalidField(): void {
    // Après le rendu des messages d'erreur.
    setTimeout(() => {
      this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid')?.focus();
    });
  }
}
