import { TeacherAccountForm } from './teacher-account.form';

const VALID_PASSWORD = 'Codabli#2026ok';

function fillValidForm(form: TeacherAccountForm): void {
  form.patchValue({
    schoolId: '3f2b6c1e-0000-4000-8000-000000000001',
    academy: 'Paris',
    ageRange: '8-11',
    girlsCount: 12,
    boysCount: 13,
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

  it('should be valid with all required fields filled', () => {
    fillValidForm(form);

    expect(form.valid).toBe(true);
  });

  it('should keep the platform goal and accessibility needs optional', () => {
    fillValidForm(form);

    expect(form.controls.platformGoal.valid).toBe(true);
    expect(form.controls.accessibility.valid).toBe(true);
  });

  it('should require the GDPR / terms consent', () => {
    fillValidForm(form);
    form.controls.termsAccepted.setValue(false);

    expect(form.controls.termsAccepted.hasError('required')).toBe(true);
    expect(form.valid).toBe(false);
  });

  it.each(['schoolId', 'academy', 'ageRange', 'girlsCount', 'boysCount'] as const)(
    'should require %s',
    (field) => {
      expect(form.controls[field].hasError('required')).toBe(true);
    },
  );

  it.each([
    [-1, 'min'],
    [100, 'max'],
    [2.5, 'pattern'],
  ])('should reject a student count of %s (%s)', (count, error) => {
    form.controls.girlsCount.setValue(count);

    expect(form.controls.girlsCount.hasError(error)).toBe(true);
  });

  it('should accept zero students', () => {
    form.controls.boysCount.setValue(0);

    expect(form.controls.boysCount.valid).toBe(true);
  });

  it.each([
    ['lastName', ''],
    ['lastName', 'A'],
    ['lastName', 'A'.repeat(51)],
    ['firstName', ''],
    ['firstName', 'B'],
    ['firstName', 'B'.repeat(51)],
  ] as const)('should reject %s = "%s"', (field, value) => {
    form.controls[field].setValue(value);

    expect(form.controls[field].valid).toBe(false);
  });

  it('should reject an invalid email', () => {
    form.controls.email.setValue('pas-un-email');

    expect(form.controls.email.hasError('email')).toBe(true);
  });

  it.each([
    ['Court#1a', 'minlength'],
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
      lastName: '  Martin ',
      email: ' Lea.Martin@AC-Paris.fr ',
      accessibility: { highContrast: true, dysPmrSupport: true },
    });

    const account = form.toTeacherAccount();

    expect(account.lastName).toBe('Martin');
    expect(account.email).toBe('lea.martin@ac-paris.fr');
    expect(account.girlsCount).toBe(12);
    expect(account.accessibilityNeeds).toEqual(['highContrast', 'dysPmrSupport']);
    expect(account.subscriptionOfferId).toBeNull();
    expect(account.termsAccepted).toBe(true);
    expect(account).not.toHaveProperty('passwordConfirmation');
  });
});
