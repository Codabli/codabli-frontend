import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import type { ApiError } from '../../models/interfaces/api-error.interface';
import { Button } from '../../shared/components/button/button.component';
import { LoginForm } from './login.form';

@Component({
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, Button],
  selector: 'app-login',
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm = new LoginForm();
  isSubmitting = signal(false);
  errorKey = signal<string | null>(null);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorKey.set(null);
    this.authService.login(this.loginForm.toLoginRequest()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl('/');
      },

      error: (error: ApiError) => {
        this.isSubmitting.set(false);
        this.errorKey.set(
          error.kind === 'bad-request' ? 'login.errors.invalidCredentials' : 'login.errors.unavailable',
        );
      },
    });
  }
}
