import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CountryCode, OTHER_COUNTRY } from '../../shared/utils/countries';
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
  Academy,
  ACCESSIBILITY_NEEDS,
  AccessibilityNeed,
  SchoolSector,
  SchoolType,
} from './teacher-account.options';

export const SCHOOL_NAME_MAX_LENGTH = 150;
/** Ville, région, pays saisi librement, précision du type d'établissement. */
export const PLACE_MAX_LENGTH = 100;

const requiredPlaceValidators = [
  requiredTrimmedValidator(),
  trimmedLengthValidator(1, PLACE_MAX_LENGTH),
];

const optionalPlaceValidators = [trimmedLengthValidator(1, PLACE_MAX_LENGTH)];

/** Pays de la liste, ou « Autre pays ou territoire » (nom saisi dans schoolCountryOther). */
export type SchoolCountry = CountryCode | typeof OTHER_COUNTRY;

type AccessibilityControls = Record<AccessibilityNeed, FormControl<boolean>>;

export interface TeacherSchool {
  /** null quand le pays n'est pas dans la liste : voir countryOther. */
  country: CountryCode | null;
  countryOther: string | null;
  name: string;
  city: string;
  type: SchoolType | null;
  typeOther: string | null;
  sector: SchoolSector | null;
  region: string | null;
  /** Seulement pour un établissement en France. */
  academy: Academy | null;
}

export interface TeacherAccount {
  school: TeacherSchool;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  accessibilityNeeds: AccessibilityNeed[];
  subscriptionOfferId: string | null;
  termsAccepted: boolean;
}

export class TeacherAccountForm extends FormGroup<{
  schoolCountry: FormControl<SchoolCountry | null>;
  schoolCountryOther: FormControl<string>;
  schoolName: FormControl<string>;
  schoolCity: FormControl<string>;
  schoolType: FormControl<SchoolType | null>;
  schoolTypeOther: FormControl<string>;
  schoolSector: FormControl<SchoolSector | null>;
  schoolRegion: FormControl<string>;
  academy: FormControl<Academy | null>;
  lastName: FormControl<string>;
  firstName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  passwordConfirmation: FormControl<string>;
  accessibility: FormGroup<AccessibilityControls>;
  subscriptionOfferId: FormControl<string | null>;
  termsAccepted: FormControl<boolean>;
}> {
  constructor() {
    super(
      {
        // Nom, pays et ville suffisent à identifier l'établissement à l'inscription (annexe 16).
        schoolCountry: new FormControl<SchoolCountry | null>(null, Validators.required),

        // Obligatoire uniquement si « Autre pays ou territoire » est choisi (voir plus bas).
        schoolCountryOther: new FormControl('', { nonNullable: true }),

        schoolName: new FormControl('', {
          nonNullable: true,
          validators: [requiredTrimmedValidator(), trimmedLengthValidator(1, SCHOOL_NAME_MAX_LENGTH)],
        }),

        schoolCity: new FormControl('', { nonNullable: true, validators: requiredPlaceValidators }),

        schoolType: new FormControl<SchoolType | null>(null),

        schoolTypeOther: new FormControl('', {
          nonNullable: true,
          validators: optionalPlaceValidators,
        }),

        schoolSector: new FormControl<SchoolSector | null>(null),

        schoolRegion: new FormControl('', {
          nonNullable: true,
          validators: optionalPlaceValidators,
        }),

        academy: new FormControl<Academy | null>(null),

        lastName: new FormControl('', { nonNullable: true, validators: NAME_VALIDATORS }),

        firstName: new FormControl('', { nonNullable: true, validators: NAME_VALIDATORS }),

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

        accessibility: new FormGroup(
          Object.fromEntries(
            ACCESSIBILITY_NEEDS.map((need) => [
              need,
              new FormControl(false, { nonNullable: true }),
            ]),
          ) as AccessibilityControls,
        ),

        // null = « Je choisirai plus tard » : la souscription se fait une fois connecté.
        subscriptionOfferId: new FormControl<string | null>(null),

        termsAccepted: new FormControl(false, {
          nonNullable: true,
          validators: Validators.requiredTrue,
        }),
      },
      { validators: passwordMatchValidator('password', 'passwordConfirmation') },
    );

    // Le nom du pays devient obligatoire avec « Autre » ; l'académie ne concerne que la France.
    this.controls.schoolCountry.valueChanges.subscribe((country) => {
      const countryOther = this.controls.schoolCountryOther;

      if (country === OTHER_COUNTRY) {
        countryOther.setValidators(requiredPlaceValidators);
      } else {
        countryOther.clearValidators();
        countryOther.setValue('');
      }
      countryOther.updateValueAndValidity();

      if (country !== 'FR') {
        this.controls.academy.setValue(null);
      }
    });

    // La précision n'a de sens que pour le type « Autre ».
    this.controls.schoolType.valueChanges.subscribe((type) => {
      if (type !== 'other') {
        this.controls.schoolTypeOther.setValue('');
      }
    });
  }

  /** Valeur prête à être envoyée : champs nettoyés, sans la confirmation de mot de passe. */
  toTeacherAccount(): TeacherAccount {
    const value = this.getRawValue();
    const country = value.schoolCountry;

    return {
      school: {
        country: country === OTHER_COUNTRY ? null : country,
        countryOther: country === OTHER_COUNTRY ? value.schoolCountryOther.trim() : null,
        name: value.schoolName.trim(),
        city: value.schoolCity.trim(),
        type: value.schoolType,
        typeOther: value.schoolType === 'other' ? optionalText(value.schoolTypeOther) : null,
        sector: value.schoolSector,
        region: optionalText(value.schoolRegion),
        academy: country === 'FR' ? value.academy : null,
      },
      lastName: value.lastName.trim(),
      firstName: value.firstName.trim(),
      email: value.email.trim().toLowerCase(),
      password: value.password,
      accessibilityNeeds: ACCESSIBILITY_NEEDS.filter((need) => value.accessibility[need]),
      subscriptionOfferId: value.subscriptionOfferId,
      termsAccepted: value.termsAccepted,
    };
  }
}

/** Texte facultatif : null s'il est vide une fois nettoyé. */
function optionalText(text: string): string | null {
  return text.trim() || null;
}
