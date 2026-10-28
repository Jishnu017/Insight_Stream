import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // We need to wait for the promise to resolve to get the Clerk token
  return from(authService.getToken()).pipe(
    switchMap(token => {
      let headers = req.headers;
      
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }

      const authReq = req.clone({ headers });
      return next(authReq);
    })
  );
};
