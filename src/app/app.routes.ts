import { Routes } from '@angular/router';
import { authenticatedGuard } from './shared/guards/authenticated.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'events',
    canActivate: [authenticatedGuard],
    loadChildren: () =>
      import('./events/events.routes').then((m) => m.eventsRoutes),
  },
  {
    path: 'profile',
    canActivate: [authenticatedGuard],
    loadChildren: () =>
      import('./profile/profile.routes').then((m) => m.profileRoutes),
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];
