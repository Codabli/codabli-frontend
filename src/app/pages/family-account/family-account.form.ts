import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AppLanguage } from '../../models/types/app-language.type';
import {
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../shared/validators/password.validators';
import {
  EMAIL_MAX_LENGTH,
  NAME_VALIDATORS,
  requiredTrimmedValidator,
  trimmedLengthValidator,
} from '../../shared/validators/text.validators';
import {
  FamilyPlatformGoal,
  NOTIFICATION_PREFERENCES,
  NotificationPreference,
} from './family-account.options';

export const ADDRESS_MAX_LENGTH = 150;
export const POSTAL_CODE_CITY_MAX_LENGTH = 100;

/** Les profils enfants concernent les moins de 18 ans. */
export const CHILD_MAX_AGE = 18;

// Motifs appliqués après suppression des espaces, points, tirets et parenthèses,
// avec le préfixe « 00 » remplacé par « + ».
const FRENCH_NATIONAL_PATTERN = /^0[1-9]\d{8}$/;
const FRENCH_INTERNATIONAL_PATTERN = /^\+33[1-9]\d{8}$/;
// Format international E.164 : indicatif pays compris, 8 à 15 chiffres.
const INTERNATIONAL_PATTERN = /^\+[1-9]\d{7,14}$/;

/**
 * Numéro de téléphone, optionnel : français (06 12 34 56 78, +33 6…, 0033 6…)
 * ou étranger avec son indicatif (+44 20 7946 0958).
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value?.trim();

    if (!value) {
      return null;
    }

    const phone = value.replace(/[\s.()-]/g, '').replace(/^00/, '+');
    const pattern = phone.startsWith('+33')
      ? FRENCH_INTERNATIONAL_PATTERN
      : phone.startsWith('+')
        ? INTERNATIONAL_PATTERN
        : FRENCH_NATIONAL_PATTERN;

    return pattern.test(phone) ? null : { phone: true };
  };
}

/** Date locale au format AAAA-MM-JJ, celui des inputs de type date. */
export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Bornes de la date de naissance d'un enfant : il y a CHILD_MAX_AGE ans → aujourd'hui. */
export function childBirthDateBounds(today: Date = new Date()): { min: string; max: string } {
  const oldest = new Date(today);
  oldest.setFullYear(today.getFullYear() - CHILD_MAX_AGE);

  return { min: toIsoDate(oldest), max: toIsoDate(today) };
}

/**
 * Date de naissance d'un enfant (valeur AAAA-MM-JJ d'un input date) :
 * ni dans le futur, ni il y a plus de CHILD_MAX_AGE ans (écarte aussi les années mal saisies).
 */
export function childBirthDateValidator(today: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const { min, max } = childBirthDateBounds(today());

    // Les dates ISO se comparent correctement en tant que chaînes.
    if (control.value > max) {
      return { futureDate: true };
    }

    if (control.value < min) {
      return { childTooOld: { maxAge: CHILD_MAX_AGE } };
    }

    return null;
  };
}

type NotificationControls = Record<NotificationPreference, FormControl<boolean>>;

export type ChildForm = FormGroup<{
  lastName: FormControl<string>;
  firstName: FormControl<string>;
  birthDate: FormControl<string>;
}>;

export interface Child {
  lastName: string;
  firstName: string;
  birthDate: string;
}

export interface FamilyAccount {
  children: Child[];
  lastName: string;
  firstName: string;
  address: string;
  postalCodeCity: string;
  phone: string | null;
  platformGoal: FamilyPlatformGoal | null;
  email: string;
  password: string;
  preferredLanguage: AppLanguage;
  notificationPreferences: NotificationPreference[];
  subscriptionOfferId: string | null;
  termsAccepted: boolean;
  salesTermsAccepted: boolean;
}

export function createChildForm(): ChildForm {
  return new FormGroup({
    lastName: new FormControl('', {
      nonNullable: true,
      validators: NAME_VALIDATORS,
    }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: NAME_VALIDATORS,
    }),
    birthDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, childBirthDateValidator()],
    }),
  });
}

export class FamilyAccountForm extends FormGroup<{
  children: FormArray<ChildForm>;
  lastName: FormControl<string>;
  firstName: FormControl<string>;
  address: FormControl<string>;
  postalCodeCity: FormControl<string>;
  phone: FormControl<string>;
  platformGoal: FormControl<FamilyPlatformGoal | null>;
  email: FormControl<string>;
  password: FormControl<string>;
  passwordConfirmation: FormControl<string>;
  preferredLanguage: FormControl<AppLanguage>;
  notifications: FormGroup<NotificationControls>;
  subscriptionOfferId: FormControl<string | null>;
  termsAccepted: FormControl<boolean>;
  salesTermsAccepted: FormControl<boolean>;
}> {
  constructor(defaultLanguage: AppLanguage = 'fr') {
    super(
      {
        // Au moins un enfant : le premier profil ne peut pas être retiré.
        children: new FormArray([createChildForm()]),

        lastName: new FormControl('', {
          nonNullable: true,
          validators: NAME_VALIDATORS,
        }),

        firstName: new FormControl('', {
          nonNullable: true,
          validators: NAME_VALIDATORS,
        }),

        // Adresse requise pour la facturation et les livraisons de la boutique.
        address: new FormControl('', {
          nonNullable: true,
          validators: [requiredTrimmedValidator(), trimmedLengthValidator(0, ADDRESS_MAX_LENGTH)],
        }),

        postalCodeCity: new FormControl('', {
          nonNullable: true,
          validators: [
            requiredTrimmedValidator(),
            trimmedLengthValidator(0, POSTAL_CODE_CITY_MAX_LENGTH),
          ],
        }),

        phone: new FormControl('', {
          nonNullable: true,
          validators: phoneValidator(),
        }),

        platformGoal: new FormControl<FamilyPlatformGoal | null>(null),

        email: new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.email,
            Validators.maxLength(EMAIL_MAX_LENGTH),
          ],
        }),

        password: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, passwordStrengthValidator()],
        }),

        passwordConfirmation: new FormControl('', {
          nonNullable: true,
          validators: Validators.required,
        }),

        preferredLanguage: new FormControl<AppLanguage>(defaultLanguage, {
          nonNullable: true,
        }),

        // Opt-in RGPD : aucune notification cochée par défaut.
        notifications: new FormGroup(
          Object.fromEntries(
            NOTIFICATION_PREFERENCES.map((preference) => [
              preference,
              new FormControl(false, { nonNullable: true }),
            ]),
          ) as NotificationControls,
        ),

        // null = « Je choisirai plus tard » : la souscription se fait une fois connecté.
        subscriptionOfferId: new FormControl<string | null>(null),

        // CGU + Politique de confidentialité.
        termsAccepted: new FormControl(false, {
          nonNullable: true,
          validators: Validators.requiredTrue,
        }),

        // CGV, nécessaires pour la facturation et les achats.
        salesTermsAccepted: new FormControl(false, {
          nonNullable: true,
          validators: Validators.requiredTrue,
        }),
      },
      {
        validators: passwordMatchValidator('password', 'passwordConfirmation'),
      },
    );
  }

  get children(): FormArray<ChildForm> {
    return this.controls.children;
  }

  addChild(): void {
    this.children.push(createChildForm());
  }

  removeChild(index: number): void {
    if (this.children.length > 1) {
      this.children.removeAt(index);
    }
  }

  /** Valeur prête à être envoyée : champs nettoyés, sans la confirmation de mot de passe. */
  toFamilyAccount(): FamilyAccount {
    const value = this.getRawValue();
    const phone = value.phone.trim();

    return {
      children: value.children.map((child) => ({
        lastName: child.lastName.trim(),
        firstName: child.firstName.trim(),
        birthDate: child.birthDate,
      })),
      lastName: value.lastName.trim(),
      firstName: value.firstName.trim(),
      address: value.address.trim(),
      postalCodeCity: value.postalCodeCity.trim(),
      phone: phone || null,
      platformGoal: value.platformGoal,
      email: value.email.trim().toLowerCase(),
      password: value.password,
      preferredLanguage: value.preferredLanguage,
      notificationPreferences: NOTIFICATION_PREFERENCES.filter(
        (preference) => value.notifications[preference],
      ),
      subscriptionOfferId: value.subscriptionOfferId,
      termsAccepted: value.termsAccepted,
      salesTermsAccepted: value.salesTermsAccepted,
    };
  }
}
