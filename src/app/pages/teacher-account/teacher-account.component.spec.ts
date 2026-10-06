import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { School } from '../../models/interfaces/school.interface';
import { SubscriptionOffer } from '../../models/interfaces/subscription-offer.interface';
import { TeacherAccountComponent } from './teacher-account.component';

const OFFER: SubscriptionOffer = {
  id: 'offer-1',
  code: 'ENS_ANNUEL',
  nom: 'Enseignant annuel',
  description: 'Accès complet pour une classe',
  publicCible: 'enseignant',
  tarif: 49.9,
  duree: 'annuel',
  actif: true,
};

describe('TeacherAccountComponent', () => {
  let component: TeacherAccountComponent;
  let fixture: ComponentFixture<TeacherAccountComponent>;
  let element: HTMLElement;
  let http: HttpTestingController;

  async function respond(
    schools: School[] | 'error' = [],
    offers: SubscriptionOffer[] | 'error' = [],
  ): Promise<void> {
    const error = { status: 0, statusText: 'Unknown Error' };
    const schoolsRequest = http.expectOne('/api/ecoles');
    const offersRequest = http.expectOne(
      (req) =>
        req.url === '/api/abonnements/offres' && req.params.get('publicCible') === 'enseignant',
    );

    schools === 'error' ? schoolsRequest.flush(null, error) : schoolsRequest.flush(schools);
    offers === 'error' ? offersRequest.flush(null, error) : offersRequest.flush(offers);

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

  afterEach(() => http.verify());

  it('should render the fields of the mockup in order', async () => {
    await respond();

    const ids = Array.from(element.querySelectorAll('form input, form select')).map((el) => el.id);

    expect(ids).toEqual([
      'schoolId',
      'academy',
      'ageRange',
      'girlsCount',
      'boysCount',
      'platformGoal',
      'lastName',
      'firstName',
      'email',
      'password',
      'passwordConfirmation',
      'accessibility-highContrast',
      'accessibility-reducedMotion',
      'accessibility-signLanguageAudioDescription',
      'accessibility-dysPmrSupport',
      'subscription-later',
      'termsAccepted',
    ]);
  });

  it('should list the schools returned by the API', async () => {
    await respond([
      { id: 'a', nom: 'École Jules Ferry', pays: 'France', ville: 'Lyon' },
      { id: 'b', nom: 'Collège Victor Hugo', pays: 'France', ville: null },
    ]);

    const options = Array.from(element.querySelectorAll('#schoolId option')).map((o) =>
      o.textContent!.trim(),
    );

    expect(options.slice(1)).toEqual(['École Jules Ferry (Lyon)', 'Collège Victor Hugo']);
  });

  it('should warn when the schools cannot be loaded', async () => {
    await respond('error');

    expect(component.schoolsUnavailable()).toBe(true);
    expect(element.querySelector('#schoolId-error')).not.toBeNull();
  });

  it('should list only the active teacher subscription offers', async () => {
    await respond([], [OFFER, { ...OFFER, id: 'offer-2', actif: false }]);

    expect(element.querySelector('#subscription-offer-1')).not.toBeNull();
    expect(element.querySelector('#subscription-offer-2')).toBeNull();
  });

  it('should default to "choose later" and store the selected offer', async () => {
    await respond([], [OFFER]);

    const later = element.querySelector<HTMLInputElement>('#subscription-later')!;
    expect(later.checked).toBe(true);

    element.querySelector<HTMLInputElement>('#subscription-offer-1')!.click();

    expect(component.teacherAccountForm.controls.subscriptionOfferId.value).toBe('offer-1');
  });

  it('should still offer "choose later" when the offers cannot be loaded', async () => {
    await respond([], 'error');

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
