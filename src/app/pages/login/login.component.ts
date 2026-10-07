import { Component } from '@angular/core';
import { Button } from '../../shared/components/button/button.component';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginForm } from './login.form';

@Component({
  imports: [ReactiveFormsModule, TranslatePipe, Button],
  selector: 'app-login',
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
})
export class LoginComponent {

  loginForm = new LoginForm()

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched()
      return;
    }

    const { email } = this.loginForm.getRawValue();

    console.log('Connexion de ', email)
  }
}