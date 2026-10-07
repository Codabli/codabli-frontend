import { afterNextRender, Component, ElementRef, inject, Injector, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, map, of } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { SubscriptionOfferService } from '../../core/services/subscription-offer.service';
import { Button } from '../../shared/components/button/button.component';
import { FamilyAccountForm } from './family-account.form';
import { FAMILY_PLATFORM_GOALS, NOTIFICATION_PREFERENCES } from './family-account.options';

export interface FieldError {
  key: string;
  params?: Record<string, unknown>;
}

const PASSWORD_RULES_ERROR: FieldError = {
  key: 'familyAccount.errors.passwordRules',
};

// Ordre de priorité : on n'affiche qu'un message à la fois par champ.
const ERROR_MESSAGES: Record<string, (error: any) => FieldError> = {
  required: () => ({ key: 'familyAccount.errors.required' }),
  email: () => ({ key: 'familyAccount.errors.email' }),
  // Posée par le backend à la soumission (unicité de l'adresse en base).
  emailTaken: () => ({ key: 'familyAccount.errors.emailTaken' }),
  phone: () => ({ key: 'familyAccount.errors.phone' }),
  futureDate: () => ({ key: 'familyAccount.errors.futureDate' }),
  minlength: (error) => ({
    key: 'familyAccount.errors.minLength',
    params: { min: error.requiredLength },
  }),
  maxlength: (error) => ({
    key: 'familyAccount.errors.maxLength',
    params: { max: error.requiredLength },
  }),
  // Message unique pour toutes les règles du mot de passe.
  missingUppercase: () => PASSWORD_RULES_ERROR,
  missingLowercase: () => PASSWORD_RULES_ERROR,
  missingDigit: () => PASSWORD_RULES_ERROR,
  missingSpecialChar: () => PASSWORD_RULES_ERROR,
};

@Component({
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, Button],
  selector: 'app-family-account',
  styleUrl: './family-account.component.scss',
  templateUrl: './family-account.component.html',
})
export class FamilyAccountComponent {
  private readonly subscriptionOfferService = inject(SubscriptionOfferService);
  private readonly languageService = inject(LanguageService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly languages = this.languageService.languages;
  readonly platformGoals = FAMILY_PLATFORM_GOALS;
  readonly notificationPreferences = NOTIFICATION_PREFERENCES;

  // En cas d'erreur, la zone propose seulement « Je choisirai plus tard ».
  subscriptionOffers = toSignal(
    this.subscriptionOfferService.getOffers('famille').pipe(
      map((offers) => offers.filter((offer) => offer.actif)),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  familyAccountForm = new FamilyAccountForm(this.languageService.currentLanguage());

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

    if (control === this.familyAccountForm.controls.password && control.hasError('minlength')) {
      return PASSWORD_RULES_ERROR;
    }

    const errorName = Object.keys(ERROR_MESSAGES).find((name) => control.errors![name]);

    return errorName ? ERROR_MESSAGES[errorName](control.errors[errorName]) : null;
  }

  hasPasswordMismatch(): boolean {
    const confirmation = this.familyAccountForm.controls.passwordConfirmation;

    return (
      this.familyAccountForm.hasError('passwordMismatch') &&
      (confirmation.touched || this.submitAttempted())
    );
  }

  addChild(): void {
    this.familyAccountForm.addChild();

    const index = this.familyAccountForm.children.length - 1;

    // Amène le focus sur le nouveau bloc pour les utilisateurs clavier / lecteur d'écran.
    afterNextRender(
      () =>
        this.elementRef.nativeElement
          .querySelector<HTMLElement>(`#child-${index}-lastName`)
          ?.focus(),
      { injector: this.injector },
    );
  }

  removeChild(index: number): void {
    this.familyAccountForm.removeChild(index);
  }

  onSubmit(): void {
    this.submitAttempted.set(true);

    // Formulaire invalide : rien n'est envoyé, donc aucun e-mail de confirmation.
    if (this.familyAccountForm.invalid) {
      this.familyAccountForm.markAllAsTouched();
      return;
    }

    const familyAccount = this.familyAccountForm.toFamilyAccount();

    // TODO: brancher sur POST /api/auth/register (rôle parent) quand le DTO backend acceptera
    // adresse, téléphone, consentements, préférences et profils enfants. En cas d'e-mail déjà
    // utilisé, poser l'erreur sur le champ : controls.email.setErrors({ emailTaken: true }).
    console.log(familyAccount);
  }
}
