import { Routes } from '@angular/router';
import { HOME_ROUTES } from './features/home/home.routes';
import { MainLayoutComponent } from './layout/public/main-layout/main-layout.component';
import { authGuard } from '@core/guards/auth.guard';

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
            (m) => m.LibraryComponent,
          ),
      },
      {
        path: 'library/tales/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/library/tale-detail/tale-detail.component').then(
            (m) => m.TaleDetailComponent,
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
        path: 'creer-un-compte/famille',
        loadComponent: () =>
          import('./pages/family-account/family-account.component').then(
            (m) => m.FamilyAccountComponent,
          ),
      },
      {
        path: 'create-danced-tale',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./pages/create-danced-tale/create-danced-tale.routes').then(
            (m) => m.CREATE_DANCED_TALE_ROUTES,
          ),
      },
      {
        path: 'art-gallery',
        loadComponent: () =>
          import('./features/art-gallery/art-gallery-component/art-gallery-component').then(
            (m) => m.ArtGalleryComponent,
          ),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('./features/subscriptions/subscriptions.component').then(
            (m) => m.SubscriptionsComponent,
          ),
      },
      {
        path: 'profile/teacher',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/teacher-account-profile/teacher-account-profile.component').then(
            (m) => m.TeacherAccountProfileComponent,
          ),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'informations',
          },
          {
            path: 'informations',
            loadComponent: () =>
              import('./pages/teacher-account-profile/components/teacher-personal-information/teacher-personal-information.component').then(
                (m) => m.TeacherPersonalInformationComponent,
              ),
          },
          {
            path: 'abonnement',
            loadComponent: () =>
              import('./pages/teacher-account-profile/components/teacher-subscription/teacher-subscription.component').then(
                (m) => m.TeacherSubscriptionComponent,
              ),
          },
        ],
      },
      {
        path: 'profile/family',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/family-account-profile/family-account-profile.component').then(
            (m) => m.FamilyAccountProfileComponent,
          ),
      },
    ],
  },
];
