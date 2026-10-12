import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { LoginRequest } from '../../models/interfaces/auth.interface';

export class LoginForm extends FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}> {
  constructor() {
    super({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),

      password: new FormControl('', {
        nonNullable: true,
        validators: Validators.required,
      }),
    });
  }

  toLoginRequest(): LoginRequest {
    const value = this.getRawValue();

    return {
      email: value.email.trim().toLowerCase(),
      password: value.password,
    };
  }
}
