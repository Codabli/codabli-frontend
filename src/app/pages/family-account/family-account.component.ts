import { afterNextRender, Component, ElementRef, inject, Injector } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, map, of } from 'rxjs';
import { SubscriptionOfferService } from '../../core/services/subscription-offer.service';
import { Button } from '../../shared/components/button/button.component';
import { AccountFormPage, accountErrorMessages } from '../../shared/forms/account-form-page';
import { childBirthDateBounds, FamilyAccountForm } from './family-account.form';
import { FAMILY_PLATFORM_GOALS, NOTIFICATION_PREFERENCES } from './family-account.options';

@Component({
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, Button],
  selector: 'app-family-account',
  styleUrl: './family-account.component.scss',
  templateUrl: './family-account.component.html',
})
export class FamilyAccountComponent extends AccountFormPage {
  private readonly subscriptionOfferService = inject(SubscriptionOfferService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly errorMessages = accountErrorMessages('familyAccount', {
    // Posée par le backend à la soumission (unicité de l'adresse en base).
    emailTaken: () => ({ key: 'familyAccount.errors.emailTaken' }),
    phone: () => ({ key: 'familyAccount.errors.phone' }),
    futureDate: () => ({ key: 'familyAccount.errors.futureDate' }),
    childTooOld: (error) => ({
      key: 'familyAccount.errors.childTooOld',
      params: { maxAge: error.maxAge },
    }),
  });

  readonly languages = this.languageService.languages;
  readonly platformGoals = FAMILY_PLATFORM_GOALS;
  readonly notificationPreferences = NOTIFICATION_PREFERENCES;
  readonly birthDateBounds = childBirthDateBounds();

  // En cas d'erreur, la zone propose seulement « Je choisirai plus tard ».
  subscriptionOffers = toSignal(
    this.subscriptionOfferService.getOffers('famille').pipe(
      map((offers) => offers.filter((offer) => offer.actif)),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  familyAccountForm = new FamilyAccountForm(this.languageService.currentLanguage());

  hasPasswordMismatch(): boolean {
    return this.hasGroupError(
      this.familyAccountForm,
      'passwordMismatch',
      this.familyAccountForm.controls.passwordConfirmation,
    );
  }

  addChild(): void {
    this.familyAccountForm.addChild();
    this.focusChildField(this.familyAccountForm.children.length - 1);
  }

  removeChild(index: number): void {
    this.familyAccountForm.removeChild(index);

    // Le bouton supprimé avait le focus : on le place sur l'enfant précédent
    // (le premier bloc ne se supprime pas, index - 1 existe toujours).
    this.focusChildField(index - 1);
  }

  onSubmit(): void {
    this.submitAttempted.set(true);

    // Formulaire invalide : rien n'est envoyé, donc aucun e-mail de confirmation.
    if (this.familyAccountForm.invalid) {
      this.familyAccountForm.markAllAsTouched();
      return;
    }

    // TODO: envoyer this.familyAccountForm.toFamilyAccount() à POST /api/auth/register (rôle
    // parent) quand le DTO backend acceptera adresse, téléphone, consentements, préférences et
    // profils enfants. Si l'e-mail est déjà utilisé : controls.email.setErrors({ emailTaken: true }).
    // Ne pas journaliser le payload : il contient le mot de passe et des données de mineurs.
  }

  /** Après le rendu, pour les utilisateurs clavier / lecteur d'écran. */
  private focusChildField(index: number): void {
    afterNextRender(
      () =>
        this.elementRef.nativeElement
          .querySelector<HTMLElement>(`#child-${index}-lastName`)
          ?.focus(),
      { injector: this.injector },
    );
  }
}
