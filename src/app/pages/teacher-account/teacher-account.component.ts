import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, map, of } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { SchoolService } from '../../core/services/school.service';
import { SubscriptionOfferService } from '../../core/services/subscription-offer.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { TeacherAccountForm } from './teacher-account.form';
import {
  ACADEMIES,
  ACCESSIBILITY_NEEDS,
  AGE_RANGES,
  PLATFORM_GOALS,
} from './teacher-account.options';

export interface FieldError {
  key: string;
  params?: Record<string, unknown>;
}

// Ordre de priorité : on n'affiche qu'un message à la fois par champ.
const ERROR_MESSAGES: Record<string, (error: any) => FieldError> = {
  required: () => ({ key: 'teacherAccount.errors.required' }),
  email: () => ({ key: 'teacherAccount.errors.email' }),
  pattern: () => ({ key: 'teacherAccount.errors.integer' }),
  min: (error) => ({ key: 'teacherAccount.errors.min', params: { min: error.min } }),
  max: (error) => ({ key: 'teacherAccount.errors.max', params: { max: error.max } }),
  minlength: (error) => ({
    key: 'teacherAccount.errors.minLength',
    params: { min: error.requiredLength },
  }),
  maxlength: (error) => ({
    key: 'teacherAccount.errors.maxLength',
    params: { max: error.requiredLength },
  }),
  missingUppercase: () => ({ key: 'teacherAccount.errors.passwordStrength' }),
  missingLowercase: () => ({ key: 'teacherAccount.errors.passwordStrength' }),
  missingDigit: () => ({ key: 'teacherAccount.errors.passwordStrength' }),
  missingSpecialChar: () => ({ key: 'teacherAccount.errors.passwordStrength' }),
};

@Component({
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, ButtonComponent],
  selector: 'app-teacher-account',
  styleUrl: './teacher-account.component.scss',
  templateUrl: './teacher-account.component.html',
})
export class TeacherAccountComponent {
  private readonly schoolService = inject(SchoolService);
  private readonly subscriptionOfferService = inject(SubscriptionOfferService);
  private readonly languageService = inject(LanguageService);

  readonly academies = ACADEMIES;
  readonly ageRanges = AGE_RANGES;
  readonly platformGoals = PLATFORM_GOALS;
  readonly accessibilityNeeds = ACCESSIBILITY_NEEDS;

  schoolsUnavailable = signal(false);

  schools = toSignal(
    this.schoolService.getSchools().pipe(
      catchError(() => {
        this.schoolsUnavailable.set(true);
        return of([]);
      }),
    ),
    { initialValue: [] },
  );

  // En cas d'erreur, la zone propose seulement « Je choisirai plus tard ».
  subscriptionOffers = toSignal(
    this.subscriptionOfferService.getOffers('enseignant').pipe(
      map((offers) => offers.filter((offer) => offer.actif)),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  teacherAccountForm = new TeacherAccountForm();

  submitAttempted = signal(false);

  formatPrice(amount: number): string {
    return new Intl.NumberFormat(this.languageService.currentLanguage(), {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  hasError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitAttempted());
  }

  fieldError(control: AbstractControl): FieldError | null {
    if (!this.hasError(control) || !control.errors) {
      return null;
    }

    const errorName = Object.keys(ERROR_MESSAGES).find((name) => control.errors![name]);

    return errorName ? ERROR_MESSAGES[errorName](control.errors[errorName]) : null;
  }

  hasPasswordMismatch(): boolean {
    const confirmation = this.teacherAccountForm.controls.passwordConfirmation;

    return (
      this.teacherAccountForm.hasError('passwordMismatch') &&
      (confirmation.touched || this.submitAttempted())
    );
  }

  onSubmit(): void {
    this.submitAttempted.set(true);

    if (this.teacherAccountForm.invalid) {
      this.teacherAccountForm.markAllAsTouched();
      return;
    }

    const teacherAccount = this.teacherAccountForm.toTeacherAccount();

    // TODO: brancher sur POST /api/auth/register quand le DTO backend acceptera
    // académie, tranche d'âge, effectifs et objectif.
    console.log(teacherAccount);
  }
}
