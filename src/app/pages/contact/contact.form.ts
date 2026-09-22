import { FormControl, FormGroup, Validators } from '@angular/forms';

export class ContactForm extends FormGroup {

  constructor() {
    super({
      profile: new FormControl('', Validators.required),

      fullName: new FormControl(''),

      schoolName: new FormControl('', Validators.required),

      country: new FormControl('', Validators.required),

      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),

      subject: new FormControl('', Validators.required),

      message: new FormControl('', Validators.required),

      termsAccepted: new FormControl(false, Validators.requiredTrue)
    });
  }
}