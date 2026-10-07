import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/public/main-layout/main-layout.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, children: [{ path: 'login', component: LoginComponent }]
  }
];
