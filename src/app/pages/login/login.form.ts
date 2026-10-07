import { FormControl, FormGroup, Validators } from '@angular/forms';

export class LoginForm extends FormGroup {

  constructor() {
    super({
        email: new FormControl('', [
            Validators.required,
            Validators.email
        ]),

        password: new FormControl('', Validators.required)
    });
  }
}