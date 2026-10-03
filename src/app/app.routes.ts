import { Routes } from '@angular/router';
import { HOME_ROUTES } from './features/home/home.routes';
import { MainLayoutComponent } from './layout/public/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: HOME_ROUTES,
  },
];
