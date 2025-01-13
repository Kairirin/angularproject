import { Routes } from '@angular/router';
import { loginActivateGuard } from './shared/guards/login-activate.guard';
import { logoutActivateGuard } from './shared/guards/logout-activate.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [logoutActivateGuard],
    loadChildren: () =>
      import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'events',
    canActivate: [loginActivateGuard],
    loadChildren: () =>
      import('./events/events.routes').then((m) => m.eventsRoutes),
  },
  {
    path: 'profile',
    canActivate: [loginActivateGuard],
    loadChildren: () =>
      import('./profile/profile.routes').then((m) => m.profileRoutes),
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];
