import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AgeRange } from '../../../models/types/age-range.type';
import { PerformanceSpace } from '../../../models/types/performance-space.type';
import { ProjectContext } from '../../../models/interfaces/project-context.interface';

export const SECRET_INGREDIENT_MAX_LENGTH = 40;

// Validators.required accepte une chaîne composée d'espaces.
function requiredText(control: AbstractControl<string>): ValidationErrors | null {
  return control.value?.trim() ? null : { required: true };
}

export class ProjectContextForm extends FormGroup<{
  ageRange: FormControl<AgeRange | null>;
  country: FormControl<string>;
  region: FormControl<string>;
  city: FormControl<string>;
  theme: FormControl<string>;
  secretIngredients: FormControl<string[]>;
  performanceSpace: FormControl<PerformanceSpace | null>;
}> {
  constructor() {
    super({
      // RG-CMC-01 : tranche d'âge, région/pays et thème obligatoires.
      ageRange: new FormControl<AgeRange | null>(null, Validators.required),
      country: new FormControl('', { nonNullable: true, validators: requiredText }),
      region: new FormControl('', { nonNullable: true, validators: requiredText }),
      city: new FormControl('', { nonNullable: true }),
      theme: new FormControl('', { nonNullable: true, validators: requiredText }),

      // RG-CMC-02 : mots-clés libres, saisis sous forme de puces.
      secretIngredients: new FormControl<string[]>([], { nonNullable: true }),

      performanceSpace: new FormControl<PerformanceSpace | null>(null),
    });
  }

  /**
   * Ajoute une puce. Retourne false si le mot-clé est vide ou déjà présent
   * (comparaison insensible à la casse).
   */
  addSecretIngredient(rawValue: string): boolean {
    const ingredient = rawValue.trim().slice(0, SECRET_INGREDIENT_MAX_LENGTH);
    const ingredients = this.controls.secretIngredients.value;

    if (
      !ingredient ||
      ingredients.some((existing) => existing.toLowerCase() === ingredient.toLowerCase())
    ) {
      return false;
    }

    this.controls.secretIngredients.setValue([...ingredients, ingredient]);
    this.controls.secretIngredients.markAsDirty();
    return true;
  }

  removeSecretIngredient(index: number): void {
    this.controls.secretIngredients.setValue(
      this.controls.secretIngredients.value.filter((_, i) => i !== index),
    );
    this.controls.secretIngredients.markAsDirty();
  }

  /** Le brouillon peut dater d'une version précédente du formulaire : patchValue ignore les clés absentes. */
  fromProjectContext(context: Partial<ProjectContext>): void {
    this.patchValue({
      ...context,
      secretIngredients: Array.isArray(context.secretIngredients) ? [...context.secretIngredients] : [],
    });
  }

  /** À n'appeler que sur un formulaire valide. */
  toProjectContext(): ProjectContext {
    const value = this.getRawValue();

    return {
      ageRange: value.ageRange!,
      country: value.country.trim(),
      region: value.region.trim(),
      city: value.city.trim(),
      theme: value.theme.trim(),
      secretIngredients: value.secretIngredients,
      performanceSpace: value.performanceSpace,
    };
  }
}
