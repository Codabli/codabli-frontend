import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Réserve une route aux utilisateurs connectés ; sinon renvoie au login, qui ramènera ici. */
export const requireAuthentication: CanActivateFn = (_route, state) => {
  if (inject(AuthService).getAccessToken()) {
    return true;
  }

  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
