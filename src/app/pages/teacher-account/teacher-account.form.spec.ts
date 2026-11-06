import { OTHER_COUNTRY } from '../../shared/utils/countries';
import { SCHOOL_NAME_MAX_LENGTH, TeacherAccountForm } from './teacher-account.form';

const VALID_PASSWORD = 'Codabli#2026ok';

function fillValidForm(form: TeacherAccountForm): void {
  form.patchValue({
    schoolCountry: 'FR',
    schoolName: 'École Jules Ferry',
    schoolCity: 'Lyon',
    lastName: 'Martin',
    firstName: 'Léa',
    email: 'lea.martin@ac-paris.fr',
    password: VALID_PASSWORD,
    passwordConfirmation: VALID_PASSWORD,
    termsAccepted: true,
  });
}

describe('TeacherAccountForm', () => {
  let form: TeacherAccountForm;

  beforeEach(() => {
    form = new TeacherAccountForm();
  });

  it('should be valid with only the required fields filled', () => {
    fillValidForm(form);

    expect(form.valid).toBe(true);
  });

  it('should keep the school details and accessibility preferences optional', () => {
    fillValidForm(form);

    expect(form.controls.schoolType.valid).toBe(true);
    expect(form.controls.schoolSector.valid).toBe(true);
    expect(form.controls.schoolRegion.valid).toBe(true);
    expect(form.controls.academy.valid).toBe(true);
    expect(form.controls.accessibility.valid).toBe(true);
  });

  it('should require the GDPR / terms consent', () => {
    fillValidForm(form);
    form.controls.termsAccepted.setValue(false);

    expect(form.controls.termsAccepted.hasError('required')).toBe(true);
    expect(form.valid).toBe(false);
  });

  it.each(['schoolCountry', 'schoolName', 'schoolCity'] as const)('should require %s', (field) => {
    expect(form.controls[field].hasError('required')).toBe(true);
  });

  it.each([
    ['schoolName', '   '],
    ['schoolName', 'A'.repeat(SCHOOL_NAME_MAX_LENGTH + 1)],
    ['schoolCity', '   '],
  ] as const)('should reject %s = "%s"', (field, value) => {
    form.controls[field].setValue(value);

    expect(form.controls[field].valid).toBe(false);
  });

  it('should require the country name only when "other country" is chosen', () => {
    expect(form.controls.schoolCountryOther.valid).toBe(true);

    form.controls.schoolCountry.setValue(OTHER_COUNTRY);
    expect(form.controls.schoolCountryOther.hasError('required')).toBe(true);

    form.controls.schoolCountryOther.setValue('Groenland');
    expect(form.controls.schoolCountryOther.valid).toBe(true);
  });

  it('should clear the typed country name when a listed country is chosen again', () => {
    form.controls.schoolCountry.setValue(OTHER_COUNTRY);
    form.controls.schoolCountryOther.setValue('Groenland');

    form.controls.schoolCountry.setValue('BE');

    expect(form.controls.schoolCountryOther.value).toBe('');
    expect(form.controls.schoolCountryOther.valid).toBe(true);
  });

  it('should clear the academy when the country is no longer France', () => {
    form.controls.schoolCountry.setValue('FR');
    form.controls.academy.setValue('Lyon');

    form.controls.schoolCountry.setValue('BE');

    expect(form.controls.academy.value).toBeNull();
  });

  it('should clear the school type details when the type is no longer "other"', () => {
    form.controls.schoolType.setValue('other');
    form.controls.schoolTypeOther.setValue('École en plein air');

    form.controls.schoolType.setValue('primary');

    expect(form.controls.schoolTypeOther.value).toBe('');
  });

  it.each([
    ['lastName', ''],
    ['lastName', 'A'],
    ['lastName', 'A'.repeat(51)],
    ['firstName', ''],
    ['firstName', 'B'],
    ['firstName', 'B'.repeat(51)],
    ['lastName', '   '],
  ] as const)('should reject %s = "%s"', (field, value) => {
    form.controls[field].setValue(value);

    expect(form.controls[field].valid).toBe(false);
  });

  it('should reject an invalid email', () => {
    form.controls.email.setValue('pas-un-email');

    expect(form.controls.email.hasError('email')).toBe(true);
  });

  it.each([
    ['Court#1a', 'passwordTooShort'],
    ['codabli#2026ok', 'missingUppercase'],
    ['CODABLI#2026OK', 'missingLowercase'],
    ['Codabli#Deux!', 'missingDigit'],
    ['Codabli2026okk', 'missingSpecialChar'],
  ])('should reject password "%s" (%s)', (password, error) => {
    form.controls.password.setValue(password);

    expect(form.controls.password.hasError(error)).toBe(true);
  });

  it('should flag mismatching passwords', () => {
    fillValidForm(form);
    form.controls.passwordConfirmation.setValue('Autre#Mot2passe');

    expect(form.hasError('passwordMismatch')).toBe(true);
    expect(form.valid).toBe(false);
  });

  it('should build a clean payload without the password confirmation', () => {
    fillValidForm(form);
    form.patchValue({
      schoolName: '  École Jules Ferry ',
      schoolCity: ' Lyon ',
      schoolRegion: '   ',
      academy: 'Lyon',
      lastName: '  Martin ',
      email: ' Lea.Martin@AC-Paris.fr ',
      accessibility: { highContrast: true, signLanguage: true },
    });

    const account = form.toTeacherAccount();

    expect(account.school).toEqual({
      country: 'FR',
      countryOther: null,
      name: 'École Jules Ferry',
      city: 'Lyon',
      type: null,
      typeOther: null,
      sector: null,
      region: null,
      academy: 'Lyon',
    });
    expect(account.lastName).toBe('Martin');
    expect(account.email).toBe('lea.martin@ac-paris.fr');
    expect(account.accessibilityNeeds).toEqual(['highContrast', 'signLanguage']);
    expect(account.subscriptionOfferId).toBeNull();
    expect(account.termsAccepted).toBe(true);
    expect(account).not.toHaveProperty('passwordConfirmation');
  });

  it('should send the typed country name when the country is not in the list', () => {
    fillValidForm(form);
    form.controls.schoolCountry.setValue(OTHER_COUNTRY);
    form.controls.schoolCountryOther.setValue('  Groenland ');

    const { school } = form.toTeacherAccount();

    expect(school.country).toBeNull();
    expect(school.countryOther).toBe('Groenland');
    expect(school.academy).toBeNull();
  });
});
