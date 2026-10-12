import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, map, of } from 'rxjs';
import { SchoolService } from '../../core/services/school.service';
import { SubscriptionOfferService } from '../../core/services/subscription-offer.service';
import { Button } from '../../shared/components/button/button.component';
import { AccountFormPage, accountErrorMessages } from '../../shared/forms/account-form-page';
import { TeacherAccountForm } from './teacher-account.form';
import {
  ACADEMIES,
  ACCESSIBILITY_NEEDS,
  AGE_RANGES,
  PLATFORM_GOALS,
} from './teacher-account.options';

@Component({
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, Button],
  selector: 'app-teacher-account',
  styleUrl: './teacher-account.component.scss',
  templateUrl: './teacher-account.component.html',
})
export class TeacherAccountComponent extends AccountFormPage {
  private readonly schoolService = inject(SchoolService);
  private readonly subscriptionOfferService = inject(SubscriptionOfferService);

  protected readonly errorMessages = accountErrorMessages('teacherAccount', {
    pattern: () => ({ key: 'teacherAccount.errors.integer' }),
    min: (error) => ({ key: 'teacherAccount.errors.min', params: { min: error.min } }),
    max: (error) => ({ key: 'teacherAccount.errors.max', params: { max: error.max } }),
  });

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

  hasPasswordMismatch(): boolean {
    return this.hasGroupError(
      this.teacherAccountForm,
      'passwordMismatch',
      this.teacherAccountForm.controls.passwordConfirmation,
    );
  }

  onSubmit(): void {
    this.submitAttempted.set(true);

    if (this.teacherAccountForm.invalid) {
      this.teacherAccountForm.markAllAsTouched();
      return;
    }

    // TODO: envoyer this.teacherAccountForm.toTeacherAccount() à POST /api/auth/register quand
    // le DTO backend acceptera académie, tranche d'âge, effectifs et objectif.
    // Ne pas journaliser le payload : il contient le mot de passe.
  }
}
