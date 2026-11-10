import { Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FilterSelectOption } from '@models/interfaces/filter-select-option.interface';
import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';
import { UtilisateurResponse } from '@models/interfaces/user.interface';
import { AuthService } from '@core/services/auth.service';
import { finalize } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [ButtonComponent, FilterSelectComponent, TranslatePipe],
  selector: 'app-teacher-personal-information',
  styleUrl: './teacher-personal-information.component.scss',
  templateUrl: './teacher-personal-information.component.html',
})
export class TeacherPersonalInformationComponent {
  private readonly authService = inject(AuthService);

  readonly isEditing = signal(false);
  readonly selectedSchool = signal<string | null>(null);
  readonly selectedAcademy = signal<string | null>(null);
  readonly user = signal<UtilisateurResponse | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.authService
      .getCurrentUser()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (user) => {
          this.user.set(user);
        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil :', error);

          this.error.set(
            'Impossible de charger vos informations personnelles.',
          );
        },
      });
  }

  startEditing(): void {
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    // Réinitialiser le formulaire avec les données chargées.
    this.isEditing.set(false);
  }

  readonly schoolOptions: FilterSelectOption[] = [
    { value: 'school-1', label: 'École des Lilas' },
    { value: 'school-2', label: 'École Jean Moulin' },
  ];

  readonly academyOptions: FilterSelectOption[] = [
    { value: 'paris', label: 'Académie de Paris' },
    { value: 'versailles', label: 'Académie de Versailles' },
  ];
}
