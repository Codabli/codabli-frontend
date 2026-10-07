import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SubscriptionOffer } from '../../models/interfaces/subscription-offer.interface';
import { FamilyAccountComponent } from './family-account.component';

const OFFER: SubscriptionOffer = {
  id: 'offer-1',
  code: 'FAM_ANNUEL',
  nom: 'Famille annuel',
  description: 'Accès complet pour toute la famille',
  publicCible: 'famille',
  tarif: 59.9,
  duree: 'annuel',
  actif: true,
};

describe('FamilyAccountComponent', () => {
  let component: FamilyAccountComponent;
  let fixture: ComponentFixture<FamilyAccountComponent>;
  let element: HTMLElement;
  let http: HttpTestingController;

  async function respond(offers: SubscriptionOffer[] | 'error' = []): Promise<void> {
    const offersRequest = http.expectOne(
      (req) => req.url === '/api/abonnements/offres' && req.params.get('publicCible') === 'famille',
    );

    if (offers === 'error') {
      offersRequest.flush(null, { status: 0, statusText: 'Unknown Error' });
    } else {
      offersRequest.flush(offers);
    }

    await fixture.whenStable();
  }

  function errorText(id: string): string | undefined {
    return element.querySelector(`#${id}-error`)?.textContent?.trim();
  }

  async function submit(): Promise<void> {
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyAccountComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FamilyAccountComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should render the fields of the mockup in order', async () => {
    await respond();

    const ids = Array.from(element.querySelectorAll('form input, form select')).map((el) => el.id);

    expect(ids).toEqual([
      'child-0-lastName',
      'child-0-firstName',
      'child-0-birthDate',
      'lastName',
      'firstName',
      'address',
      'postalCodeCity',
      'phone',
      'platformGoal',
      'email',
      'password',
      'passwordConfirmation',
      'preferredLanguage',
      'notification-newsletter',
      'notification-newContent',
      'notification-childActivity',
      'subscription-later',
      'termsAccepted',
      'salesTermsAccepted',
    ]);
  });

  it('should add a child block that can be removed, but not the first one', async () => {
    await respond();

    expect(element.querySelectorAll('.child-card').length).toBe(1);
    expect(element.querySelector('.child-card__remove')).toBeNull();

    const addButton = Array.from(element.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'familyAccount.form.child.add',
    )!;
    addButton.click();
    await fixture.whenStable();

    expect(element.querySelectorAll('.child-card').length).toBe(2);
    expect(document.activeElement?.id).toBe('child-1-lastName');

    element.querySelector<HTMLButtonElement>('.child-card__remove')!.click();
    await fixture.whenStable();

    expect(element.querySelectorAll('.child-card').length).toBe(1);
    expect(component.familyAccountForm.children.length).toBe(1);
  });

  it('should list only the active family subscription offers', async () => {
    await respond([OFFER, { ...OFFER, id: 'offer-2', actif: false }]);

    expect(element.querySelector('#subscription-offer-1')).not.toBeNull();
    expect(element.querySelector('#subscription-offer-2')).toBeNull();
  });

  it('should still offer "choose later" when the offers cannot be loaded', async () => {
    await respond('error');

    expect(element.querySelectorAll('.subscription-offer').length).toBe(1);
  });

  it('should show errors only after a submit attempt', async () => {
    await respond();

    expect(element.querySelectorAll('.form-field__error').length).toBe(0);

    await submit();

    expect(errorText('child-0-firstName')).toBe('familyAccount.errors.required');
    expect(errorText('termsAccepted')).toBe('familyAccount.errors.termsRequired');
    expect(errorText('salesTermsAccepted')).toBe('familyAccount.errors.salesTermsRequired');
  });

  it.each(['court', 'beaucouplongmaissansregle'])(
    'should show the password rules under the field for "%s"',
    async (password) => {
      await respond();

      component.familyAccountForm.controls.password.setValue(password);
      await submit();

      expect(errorText('password')).toBe('familyAccount.errors.passwordRules');
    },
  );

  it('should show the "email already used" message under the email field', async () => {
    await respond();

    component.familyAccountForm.controls.email.setErrors({ emailTaken: true });
    component.familyAccountForm.controls.email.markAsTouched();
    await fixture.whenStable();

    expect(errorText('email')).toBe('familyAccount.errors.emailTaken');
  });

  it('should not send the account when the form is invalid', async () => {
    await respond();
    const toFamilyAccount = vi.spyOn(component.familyAccountForm, 'toFamilyAccount');

    await submit();

    expect(toFamilyAccount).not.toHaveBeenCalled();
  });
});
