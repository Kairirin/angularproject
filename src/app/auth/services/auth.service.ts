import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User, UserFacebook, UserGoogle, UserLogin } from '../../shared/interfaces/user';
import { catchError, map, Observable, of } from 'rxjs';
import { SingleUserResponse, TokenResponse } from '../../shared/interfaces/responses';
import { CookieService } from 'ngx-cookie-service';
import { SsrCookieService } from '../../shared/services/ssr-cookie.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #authUrl = 'auth';
  #logged = signal(false);
  #http = inject(HttpClient);
  cookieService = inject(CookieService);
  #ssrCookieService = inject(SsrCookieService);

  getLogged() { 
    return this.#logged.asReadonly(); 
  }

  register(user: User): Observable<User> {
    return this.#http
      .post<SingleUserResponse>(`${this.#authUrl}/register`, user)
      .pipe(map((resp) => resp.user));
  }

  login(user: UserLogin): Observable<TokenResponse> {
    return this.#http.post<TokenResponse>(`${this.#authUrl}/login`, user).pipe(
      map((resp) => {
        this.#logged.set(true);
        /* localStorage.setItem('token', resp.accessToken); */
        this.cookieService.set('token', resp.accessToken, 365, '/');
        return resp;
      })
    );
  }

  loginGoogle(userGoogle: UserGoogle) : Observable<TokenResponse> {
    return this.#http.post<TokenResponse>(`${this.#authUrl}/google`, userGoogle).pipe(
      map((resp) => {
        this.#logged.set(true);
        /* localStorage.setItem('token', resp.accessToken); */
        this.cookieService.set('token', resp.accessToken, 365, '/');
        return resp;
      })
    );
  }

  loginFacebook(userFacebook: UserFacebook) : Observable<TokenResponse> {
    return this.#http.post<TokenResponse>(`${this.#authUrl}/facebook`, userFacebook).pipe(
      map((resp) => {
        this.#logged.set(true);
        /* localStorage.setItem('token', resp.accessToken); */
        this.cookieService.set('token', resp.accessToken, 365, '/');
        return resp;
      })
    );
  }

  isLogged(): Observable<boolean> {
    const token = this.#ssrCookieService.getCookie('token');
    /* if (!this.#logged() && !localStorage.getItem('token')) { */
    if (!this.#logged() && !token) {
      return of(false);
/*     } else if (!this.#logged() && localStorage.getItem('token')) { */
    } else if (!this.#logged() && token) {
      return this.#http.get<Observable<boolean>>(`${this.#authUrl}/validate`).pipe(
        map(() => {
          this.#logged.set(true);
          return true;
        }),
        catchError(() => {
          this.#logged.set(false);
          /* localStorage.removeItem('token'); */
          this.cookieService.delete('token');
          return of(false);
        })
      );
    }
    return of(true);
  }

  logout(): void {
    this.#logged.set(false);
    /* localStorage.clear(); */
    this.cookieService.delete('token');
  }
}
