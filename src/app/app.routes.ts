import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/public/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'creer-un-compte/enseignant',
        loadComponent: () =>
          import('./pages/teacher-account/teacher-account.component').then(
            (m) => m.TeacherAccountComponent,
          ),
      },
      {
        path: 'creer-un-compte/famille',
        loadComponent: () =>
          import('./pages/family-account/family-account.component').then(
            (m) => m.FamilyAccountComponent,
          ),
      },
    ],
  },
];
