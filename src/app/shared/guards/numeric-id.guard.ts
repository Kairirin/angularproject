import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const numericIdGuard: CanActivateFn = (route) => {
  const id = +route.params['id'];
  const router = inject(Router);

  if(isNaN(id) || id < 1) {
    if(location.pathname.includes("edit")){
      return router.createUrlTree(['/events/add']);
    }
    return router.createUrlTree(['/events']);
  }
  return true;
};
