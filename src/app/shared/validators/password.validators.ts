import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_MIN_LENGTH = 12;

/** Clés d'erreur posées par passwordStrengthValidator, affichées avec un message unique. */
export const PASSWORD_RULE_ERRORS = [
  'passwordTooShort',
  'missingUppercase',
  'missingLowercase',
  'missingDigit',
  'missingSpecialChar',
] as const;

/**
 * Au moins 12 caractères, dont 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.
 * Chaque règle manquante produit sa propre clé d'erreur (voir PASSWORD_RULE_ERRORS).
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value ?? '';

    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};

    if (value.length < PASSWORD_MIN_LENGTH) {
      errors['passwordTooShort'] = { requiredLength: PASSWORD_MIN_LENGTH };
    }

    if (!/[A-Z]/.test(value)) {
      errors['missingUppercase'] = true;
    }

    if (!/[a-z]/.test(value)) {
      errors['missingLowercase'] = true;
    }

    if (!/\d/.test(value)) {
      errors['missingDigit'] = true;
    }

    if (!/[^A-Za-z0-9]/.test(value)) {
      errors['missingSpecialChar'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  };
}

/**
 * Validateur de groupe : vérifie que les deux champs de mot de passe sont identiques.
 * L'erreur est posée sur le groupe ; le template l'affiche sous le champ de confirmation.
 */
export function passwordMatchValidator(passwordKey: string, confirmationKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirmation = group.get(confirmationKey)?.value;

    if (!password || !confirmation) {
      return null;
    }

    return password === confirmation ? null : { passwordMismatch: true };
  };
}
