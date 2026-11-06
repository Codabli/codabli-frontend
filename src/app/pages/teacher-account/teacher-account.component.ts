import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, map, of } from 'rxjs';
import { SubscriptionOfferService } from '../../core/services/subscription-offer.service';
import { AccountFormPage, accountErrorMessages } from '../../shared/forms/account-form-page';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { countryOptions, OTHER_COUNTRY } from '../../shared/utils/countries';
import { TeacherAccountForm } from './teacher-account.form';
import {
  ACADEMIES,
  ACCESSIBILITY_NEEDS,
  SCHOOL_SECTORS,
  SCHOOL_TYPES,
} from './teacher-account.options';

@Component({
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, ButtonComponent],
  selector: 'app-teacher-account',
  styleUrl: './teacher-account.component.scss',
  templateUrl: './teacher-account.component.html',
})
export class TeacherAccountComponent extends AccountFormPage {
  private readonly subscriptionOfferService = inject(SubscriptionOfferService);

  protected readonly errorMessages = accountErrorMessages('teacherAccount');

  readonly academies = ACADEMIES;
  readonly schoolTypes = SCHOOL_TYPES;
  readonly schoolSectors = SCHOOL_SECTORS;
  readonly accessibilityNeeds = ACCESSIBILITY_NEEDS;
  readonly otherCountry = OTHER_COUNTRY;

  // Noms des pays dans la langue de l'interface, triés ; recalculés si la langue change.
  readonly countries = computed(() => countryOptions(this.languageService.currentLanguage()));

  // En cas d'erreur, la zone propose seulement « Je choisirai plus tard ».
  subscriptionOffers = toSignal(
    this.subscriptionOfferService.getOffers('enseignant').pipe(
      map((offers) => offers.filter((offer) => offer.actif)),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  teacherAccountForm = new TeacherAccountForm();

  // Choix courants, pour afficher les champs conditionnels (autre pays, académie, autre type).
  readonly schoolCountry = toSignal(this.teacherAccountForm.controls.schoolCountry.valueChanges, {
    initialValue: null,
  });

  readonly schoolType = toSignal(this.teacherAccountForm.controls.schoolType.valueChanges, {
    initialValue: null,
  });

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
    // le DTO backend acceptera les informations de l'établissement.
    // Ne pas journaliser le payload : il contient le mot de passe.
  }
}
