import { Routes } from '@angular/router';
import { leavePageGuard } from '../shared/guards/leave-page.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
        import('./login/login.component').then((m) => m.LoginComponent),
    title: 'Login | Angular Events',
  },
  {
    path: 'register',
    canDeactivate: [leavePageGuard],
    loadComponent: () =>
        import('./register/register.component').then((m) => m.RegisterComponent),
    title: 'Register | Angular Events',
  },
];
