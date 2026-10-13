import { Routes } from '@angular/router';
import { HOME_ROUTES } from './features/home/home.routes';
import { MainLayoutComponent } from './layout/public/main-layout/main-layout.component';
import {ArtGalleryComponent} from './art-gallery-component/art-gallery-component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      ...HOME_ROUTES,
      {
        path: 'library/tales',
        loadComponent: () =>
          import('./features/library/library.component').then(
            (m) => m.LibraryComponent
          ),
      },
      {
        path: 'library/tales/:id',
        loadComponent: () =>
          import('./features/library/tale-detail/tale-detail.component').then(
            (m) => m.TaleDetailComponent
          ),
      },
      {
        path: 'creer-un-compte/enseignant',
        loadComponent: () =>
          import('./pages/teacher-account/teacher-account.component').then(
            (m) => m.TeacherAccountComponent,
          ),
      },
      {
        path: 'create-danced-tale',
        loadChildren: () =>
          import('./pages/create-danced-tale/create-danced-tale.routes').then(
            (m) => m.CREATE_DANCED_TALE_ROUTES,
          ),
      },
      {
        path: 'art-gallery',
        component: ArtGalleryComponent
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
];
