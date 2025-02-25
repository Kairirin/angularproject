import { Routes } from '@angular/router';
import { profileResolver } from './resolvers/profile.resolver';

export const profileRoutes: Routes = [
  {
    path: 'me',
    resolve: {
      user: profileResolver,
    },
    loadComponent: () =>
        import('./profile/profile.component').then((m) => m.ProfileComponent),
    data: { animation: 'others' }
  },
  {
    path: ':id',
    resolve: {
      user: profileResolver,
    },
    loadComponent: () =>
        import('./profile/profile.component').then((m) => m.ProfileComponent),
    data: { animation: 'others' }
  },
  { path: '', redirectTo: '/profile/me', pathMatch: 'full' },
];
