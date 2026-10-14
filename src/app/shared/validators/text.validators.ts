import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 254;

/**
 * Comme Validators.required, mais refuse aussi une saisie composée uniquement d'espaces,
 * que le payload enverrait vide une fois nettoyé.
 */
export function requiredTrimmedValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null =>
    control.value?.trim() ? null : { required: true };
}

/**
 * Longueur mesurée sans les espaces de début et de fin, pour qu'elle corresponde
 * à la valeur envoyée. Mêmes clés d'erreur que Validators.minLength / maxLength.
 */
export function trimmedLengthValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const actualLength = control.value?.trim().length ?? 0;

    if (actualLength === 0) {
      return null;
    }

    if (actualLength < min) {
      return { minlength: { requiredLength: min, actualLength } };
    }

    if (actualLength > max) {
      return { maxlength: { requiredLength: max, actualLength } };
    }

    return null;
  };
}

/** Nom ou prénom : requis, 2 à 50 caractères hors espaces de début et de fin. */
export const NAME_VALIDATORS: ValidatorFn[] = [
  requiredTrimmedValidator(),
  trimmedLengthValidator(NAME_MIN_LENGTH, NAME_MAX_LENGTH),
];
