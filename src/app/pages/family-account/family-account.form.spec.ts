import { FormControl } from '@angular/forms';
import { FamilyAccountForm, notInFutureValidator, phoneValidator } from './family-account.form';

const VALID_PASSWORD = 'Codabli#2026ok';

function fillValidForm(form: FamilyAccountForm): void {
  form.patchValue({
    children: [{ lastName: 'Martin', firstName: 'Zoé', birthDate: '2018-04-12' }],
    lastName: 'Martin',
    firstName: 'Léa',
    address: '12 rue des Lilas',
    postalCodeCity: '37000 Tours',
    email: 'lea.martin@example.fr',
    password: VALID_PASSWORD,
    passwordConfirmation: VALID_PASSWORD,
    termsAccepted: true,
    salesTermsAccepted: true,
  });
}

describe('FamilyAccountForm', () => {
  let form: FamilyAccountForm;

  beforeEach(() => {
    form = new FamilyAccountForm();
  });

  it('should be valid with all required fields filled', () => {
    fillValidForm(form);

    expect(form.valid).toBe(true);
  });

  it('should keep phone, platform goal, preferences and subscription optional', () => {
    fillValidForm(form);

    expect(form.controls.phone.valid).toBe(true);
    expect(form.controls.platformGoal.valid).toBe(true);
    expect(form.controls.notifications.valid).toBe(true);
    expect(form.controls.subscriptionOfferId.valid).toBe(true);
  });

  it('should default the interface language to the one given', () => {
    expect(new FamilyAccountForm('en').controls.preferredLanguage.value).toBe('en');
  });

  it.each(['termsAccepted', 'salesTermsAccepted'] as const)('should require %s', (field) => {
    fillValidForm(form);
    form.controls[field].setValue(false);

    expect(form.controls[field].hasError('required')).toBe(true);
    expect(form.valid).toBe(false);
  });

  it.each(['address', 'postalCodeCity', 'email', 'password'] as const)(
    'should require %s',
    (field) => {
      expect(form.controls[field].hasError('required')).toBe(true);
    },
  );

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

  describe('children', () => {
    it('should start with one child', () => {
      expect(form.children.length).toBe(1);
    });

    it('should add and remove children', () => {
      form.addChild();
      form.addChild();
      form.removeChild(1);

      expect(form.children.length).toBe(2);
    });

    it('should never remove the last child', () => {
      form.removeChild(0);

      expect(form.children.length).toBe(1);
    });

    it('should validate every child', () => {
      fillValidForm(form);
      form.addChild();

      expect(form.valid).toBe(false);

      form.children.at(1).setValue({
        lastName: 'Martin',
        firstName: 'Noé',
        birthDate: '2020-09-01',
      });

      expect(form.valid).toBe(true);
    });

    it.each(['lastName', 'firstName', 'birthDate'] as const)('should require %s', (field) => {
      expect(form.children.at(0).controls[field].hasError('required')).toBe(true);
    });
  });

  it('should build a clean payload without the password confirmation', () => {
    fillValidForm(form);
    form.addChild();
    form.patchValue({
      children: [{}, { lastName: ' Martin ', firstName: ' Noé', birthDate: '2020-09-01' }],
      lastName: '  Martin ',
      email: ' Lea.Martin@Example.fr ',
      phone: '  ',
      notifications: { newsletter: true, childActivity: true },
      subscriptionOfferId: 'offer-1',
    });

    const account = form.toFamilyAccount();

    expect(account.children).toEqual([
      { lastName: 'Martin', firstName: 'Zoé', birthDate: '2018-04-12' },
      { lastName: 'Martin', firstName: 'Noé', birthDate: '2020-09-01' },
    ]);
    expect(account.lastName).toBe('Martin');
    expect(account.email).toBe('lea.martin@example.fr');
    expect(account.phone).toBeNull();
    expect(account.preferredLanguage).toBe('fr');
    expect(account.notificationPreferences).toEqual(['newsletter', 'childActivity']);
    expect(account.subscriptionOfferId).toBe('offer-1');
    expect(account.termsAccepted).toBe(true);
    expect(account.salesTermsAccepted).toBe(true);
    expect(account).not.toHaveProperty('passwordConfirmation');
  });
});

describe('phoneValidator', () => {
  it.each(['', '06 12 34 56 78', '0612345678', '06.12.34.56.78', '+33 6 12 34 56 78'])(
    'should accept "%s"',
    (phone) => {
      expect(phoneValidator()(new FormControl(phone))).toBeNull();
    },
  );

  it.each(['12345', '06 12 34 56', '00 12 34 56 78', 'abcdefghij'])(
    'should reject "%s"',
    (phone) => {
      expect(phoneValidator()(new FormControl(phone))).toEqual({ phone: true });
    },
  );
});

describe('notInFutureValidator', () => {
  const validator = notInFutureValidator(() => new Date(2026, 9, 7));

  it.each(['', '2026-10-07', '2019-01-31'])('should accept "%s"', (date) => {
    expect(validator(new FormControl(date))).toBeNull();
  });

  it('should reject a date after today', () => {
    expect(validator(new FormControl('2026-10-08'))).toEqual({
      futureDate: true,
    });
  });
});
