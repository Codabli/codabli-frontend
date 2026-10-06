import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  PASSWORD_MIN_LENGTH,
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../shared/validators/password.validators';
import { Academy, AgeRange, PlatformGoal } from './teacher-account.options';

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 254;
export const STUDENT_COUNT_MAX = 99;

const nameValidators = [
  Validators.required,
  Validators.minLength(NAME_MIN_LENGTH),
  Validators.maxLength(NAME_MAX_LENGTH),
];

const studentCountValidators = [
  Validators.required,
  Validators.min(0),
  Validators.max(STUDENT_COUNT_MAX),
  Validators.pattern(/^\d+$/),
];

export interface TeacherAccount {
  schoolId: string;
  academy: Academy;
  ageRange: AgeRange;
  girlsCount: number;
  boysCount: number;
  platformGoal: PlatformGoal | null;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
}

export class TeacherAccountForm extends FormGroup<{
  schoolId: FormControl<string | null>;
  academy: FormControl<Academy | null>;
  ageRange: FormControl<AgeRange | null>;
  girlsCount: FormControl<number | null>;
  boysCount: FormControl<number | null>;
  platformGoal: FormControl<PlatformGoal | null>;
  lastName: FormControl<string>;
  firstName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  passwordConfirmation: FormControl<string>;
}> {
  constructor() {
    super(
      {
        schoolId: new FormControl<string | null>(null, Validators.required),

        academy: new FormControl<Academy | null>(null, Validators.required),

        ageRange: new FormControl<AgeRange | null>(null, Validators.required),

        girlsCount: new FormControl<number | null>(null, studentCountValidators),

        boysCount: new FormControl<number | null>(null, studentCountValidators),

        platformGoal: new FormControl<PlatformGoal | null>(null),

        lastName: new FormControl('', { nonNullable: true, validators: nameValidators }),

        firstName: new FormControl('', { nonNullable: true, validators: nameValidators }),

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
      },
      { validators: passwordMatchValidator('password', 'passwordConfirmation') },
    );
  }

  /** Valeur prête à être envoyée : champs nettoyés, sans la confirmation de mot de passe. */
  toTeacherAccount(): TeacherAccount {
    const value = this.getRawValue();

    return {
      schoolId: value.schoolId!,
      academy: value.academy!,
      ageRange: value.ageRange!,
      girlsCount: Number(value.girlsCount),
      boysCount: Number(value.boysCount),
      platformGoal: value.platformGoal,
      lastName: value.lastName.trim(),
      firstName: value.firstName.trim(),
      email: value.email.trim().toLowerCase(),
      password: value.password,
    };
  }
}
