import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/public/main-layout/main-layout.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'create-danced-tale',
        loadChildren: () =>
          import('./pages/create-danced-tale/create-danced-tale.routes').then(
            (m) => m.CREATE_DANCED_TALE_ROUTES,
          ),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
];
