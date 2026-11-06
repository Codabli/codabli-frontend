import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SubscriptionOffer } from '../../models/interfaces/subscription-offer.interface';
import { COUNTRY_CODES, OTHER_COUNTRY } from '../../shared/utils/countries';
import { TeacherAccountComponent } from './teacher-account.component';

const OFFER: SubscriptionOffer = {
  id: 'offer-1',
  code: 'ENS_ANNUEL',
  nom: 'Enseignant annuel',
  description: 'Accès complet pour une classe',
  publicCible: 'enseignant',
  tarif: 49.9,
  duree: 'annuel',
  limiteProfils: null,
  limiteClasses: null,
  stockageMo: null,
  accesWebinaires: false,
  accesCoaching: false,
  accesExports: false,
  actif: true,
};

describe('TeacherAccountComponent', () => {
  let component: TeacherAccountComponent;
  let fixture: ComponentFixture<TeacherAccountComponent>;
  let element: HTMLElement;
  let http: HttpTestingController;

  async function respond(offers: SubscriptionOffer[] | 'error' = []): Promise<void> {
    const offersRequest = http.expectOne(
      (req) =>
        req.url === '/api/abonnements/offres' && req.params.get('publicCible') === 'enseignant',
    );

    offers === 'error'
      ? offersRequest.flush(null, { status: 0, statusText: 'Unknown Error' })
      : offersRequest.flush(offers);

    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherAccountComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherAccountComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
  });

  // Vérifie aussi qu'aucun autre appel n'est fait (plus de chargement des écoles).
  afterEach(() => http.verify());

  it('should render the sign-up fields in order', async () => {
    await respond();

    const ids = Array.from(element.querySelectorAll('form input, form select')).map((el) => el.id);

    expect(ids).toEqual([
      'schoolCountry',
      'schoolName',
      'schoolCity',
      'schoolType',
      'schoolSector',
      'schoolRegion',
      'lastName',
      'firstName',
      'email',
      'password',
      'passwordConfirmation',
      'accessibility-highContrast',
      'accessibility-reducedMotion',
      'accessibility-textSpacing',
      'accessibility-keyboardNavigation',
      'accessibility-signLanguage',
      'accessibility-audioDescription',
      'subscription-later',
      'termsAccepted',
    ]);
  });

  it('should list every country plus an "other country or territory" choice', async () => {
    await respond();

    const values = Array.from(
      element.querySelectorAll<HTMLOptionElement>('#schoolCountry option'),
    ).map((option) => option.textContent!.trim());

    // Choix vide + pays de l'annexe + « Autre pays ou territoire ».
    expect(values.length).toBe(COUNTRY_CODES.length + 2);
    expect(values).toContain('France');
    expect(values).toContain('Palestine');
  });

  it('should ask for the country name only when "other country" is chosen', async () => {
    await respond();
    expect(element.querySelector('#schoolCountryOther')).toBeNull();

    component.teacherAccountForm.controls.schoolCountry.setValue(OTHER_COUNTRY);
    await fixture.whenStable();

    expect(element.querySelector('#schoolCountryOther')).not.toBeNull();
  });

  it('should show the academy only for a school in France', async () => {
    await respond();
    const country = component.teacherAccountForm.controls.schoolCountry;

    country.setValue('FR');
    await fixture.whenStable();
    expect(element.querySelector('#academy')).not.toBeNull();

    country.setValue('BE');
    await fixture.whenStable();
    expect(element.querySelector('#academy')).toBeNull();
  });

  it('should ask for details only when the school type is "other"', async () => {
    await respond();
    expect(element.querySelector('#schoolTypeOther')).toBeNull();

    component.teacherAccountForm.controls.schoolType.setValue('other');
    await fixture.whenStable();

    expect(element.querySelector('#schoolTypeOther')).not.toBeNull();
  });

  it('should mark every required field with a hidden-from-screen-readers asterisk', async () => {
    await respond();

    const requiredIds = Array.from(element.querySelectorAll('form [required]')).map((el) => el.id);
    const markedIds = Array.from(element.querySelectorAll('label'))
      .filter((label) => label.querySelector('.required-mark'))
      .map((label) => label.getAttribute('for'));

    expect(markedIds).toEqual(requiredIds);
    element.querySelectorAll('.required-mark').forEach((mark) => {
      expect(mark.getAttribute('aria-hidden')).toBe('true');
    });
    expect(element.querySelector('.account-page__required-hint')).not.toBeNull();
  });

  it('should list only the active teacher subscription offers', async () => {
    await respond([OFFER, { ...OFFER, id: 'offer-2', actif: false }]);

    expect(element.querySelector('#subscription-offer-1')).not.toBeNull();
    expect(element.querySelector('#subscription-offer-2')).toBeNull();
  });

  it('should default to "choose later" and store the selected offer', async () => {
    await respond([OFFER]);

    const later = element.querySelector<HTMLInputElement>('#subscription-later')!;
    expect(later.checked).toBe(true);

    element.querySelector<HTMLInputElement>('#subscription-offer-1')!.click();

    expect(component.teacherAccountForm.controls.subscriptionOfferId.value).toBe('offer-1');
  });

  it('should still offer "choose later" when the offers cannot be loaded', async () => {
    await respond('error');

    expect(element.querySelectorAll('.subscription-offer').length).toBe(1);
  });

  it('should show errors only after a submit attempt', async () => {
    await respond();

    expect(element.querySelectorAll('.form-field__error').length).toBe(0);

    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(element.querySelectorAll('.form-field__error').length).toBeGreaterThan(0);
  });
});
