import { computed, inject, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';
import { PASSWORD_RULE_ERRORS } from '../validators/password.validators';

export interface FieldError {
  key: string;
  params?: Record<string, unknown>;
}

/** Message à afficher pour une clé d'erreur ; l'ordre des clés fixe la priorité. */
export type ErrorMessages = Record<string, (error: any) => FieldError>;

/**
 * Messages communs aux formulaires de création de compte, sous `<prefix>.errors.*`.
 * `specific` s'insère après required / email, avant les règles de longueur.
 */
export function accountErrorMessages(prefix: string, specific: ErrorMessages = {}): ErrorMessages {
  const passwordRules = (): FieldError => ({ key: `${prefix}.errors.passwordRules` });

  return {
    required: () => ({ key: `${prefix}.errors.required` }),
    email: () => ({ key: `${prefix}.errors.email` }),
    ...specific,
    minlength: (error) => ({
      key: `${prefix}.errors.minLength`,
      params: { min: error.requiredLength },
    }),
    maxlength: (error) => ({
      key: `${prefix}.errors.maxLength`,
      params: { max: error.requiredLength },
    }),
    // Un seul message pour toutes les règles du mot de passe.
    ...Object.fromEntries(PASSWORD_RULE_ERRORS.map((name) => [name, passwordRules])),
  };
}

/**
 * Comportement partagé des pages de création de compte (enseignant, famille) :
 * affichage des erreurs par champ et formatage des prix des offres.
 */
export abstract class AccountFormPage {
  protected readonly languageService = inject(LanguageService);

  protected abstract readonly errorMessages: ErrorMessages;

  readonly submitAttempted = signal(false);

  private readonly priceFormat = computed(
    () =>
      new Intl.NumberFormat(this.languageService.currentLanguage(), {
        style: 'currency',
        currency: 'EUR',
      }),
  );

  formatPrice(amount: number): string {
    return this.priceFormat().format(amount);
  }

  /** Erreurs visibles une fois le champ quitté ou après une tentative d'envoi. */
  hasError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitAttempted());
  }

  fieldError(control: AbstractControl): FieldError | null {
    if (!this.hasError(control) || !control.errors) {
      return null;
    }

    const errors = control.errors;
    const errorName = Object.keys(this.errorMessages).find((name) => errors[name]);

    return errorName ? this.errorMessages[errorName](errors[errorName]) : null;
  }

  /** Erreur posée sur le groupe (ex. passwordMismatch), affichée sous `control`. */
  protected hasGroupError(
    group: AbstractControl,
    errorName: string,
    control: AbstractControl,
  ): boolean {
    return group.hasError(errorName) && (control.touched || this.submitAttempted());
  }
}
