import { Component, signal } from '@angular/core';
import { TeacherProfileSidebarComponent } from './components/teacher-profile-sidebar/teacher-profile-sidebar.component';
import { FilterSelectOption } from '@models/interfaces/filter-select-option.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [
    TeacherProfileSidebarComponent,
    TranslatePipe,
    RouterLink,
    RouterOutlet
  ],
  selector: 'app-teacher-account-profile',
  styleUrl: './teacher-account-profile.component.scss',
  templateUrl: './teacher-account-profile.component.html',
})
export class TeacherAccountProfileComponent {
  readonly isEditing = signal(false);
  readonly selectedSchool = signal<string | null>(null);
  readonly selectedAcademy = signal<string | null>(null);

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
