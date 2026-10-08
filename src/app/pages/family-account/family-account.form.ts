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
  PASSWORD_MIN_LENGTH,
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../shared/validators/password.validators';
import {
  FamilyPlatformGoal,
  NOTIFICATION_PREFERENCES,
  NotificationPreference,
} from './family-account.options';

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 254;
export const ADDRESS_MAX_LENGTH = 150;
export const POSTAL_CODE_CITY_MAX_LENGTH = 100;

// 10 chiffres commençant par 0, ou indicatif +33 ; espaces, points et tirets tolérés.
const FRENCH_PHONE_PATTERN = /^(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}$/;

const nameValidators = [
  Validators.required,
  Validators.minLength(NAME_MIN_LENGTH),
  Validators.maxLength(NAME_MAX_LENGTH),
];

/** Numéro de téléphone français, optionnel. */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value?.trim();

    return !value || FRENCH_PHONE_PATTERN.test(value) ? null : { phone: true };
  };
}

/** Date au format AAAA-MM-JJ (valeur d'un input date) qui ne doit pas être dans le futur. */
export function notInFutureValidator(today: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const now = today();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    // Les dates ISO se comparent correctement en tant que chaînes.
    return control.value > todayIso ? { futureDate: true } : null;
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
      validators: nameValidators,
    }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: nameValidators,
    }),
    birthDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notInFutureValidator()],
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
          validators: nameValidators,
        }),

        firstName: new FormControl('', {
          nonNullable: true,
          validators: nameValidators,
        }),

        // Adresse requise pour la facturation et les livraisons de la boutique.
        address: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.maxLength(ADDRESS_MAX_LENGTH)],
        }),

        postalCodeCity: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.maxLength(POSTAL_CODE_CITY_MAX_LENGTH)],
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
          validators: [
            Validators.required,
            Validators.minLength(PASSWORD_MIN_LENGTH),
            passwordStrengthValidator(),
          ],
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
