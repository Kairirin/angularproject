import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { User, UserFacebook, UserGoogle, UserLogin } from '../../shared/interfaces/user';
import { catchError, map, Observable, of } from 'rxjs';
import {
  SingleUserResponse,
  TokenResponse,
} from '../../shared/interfaces/responses';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #authUrl = 'auth';
  #logged: WritableSignal<boolean> = signal(false);
  #http = inject(HttpClient);

  getLogged() :boolean {
    return this.#logged();
  }

  register(user: User): Observable<User> {
    return this.#http
      .post<SingleUserResponse>(`${this.#authUrl}/register`, user)
      .pipe(map((resp) => resp.user));
  }

  login(user: UserLogin): Observable<TokenResponse> {
    return this.#http.post<TokenResponse>(`${this.#authUrl}/login`, user).pipe(
      map((resp) => {
        this.#logged = signal(true);
        localStorage.setItem('token', resp.accessToken);
        return resp;
      })
    );
  }

  loginGoogle(userGoogle: UserGoogle) : Observable<TokenResponse> {
    return this.#http.post<TokenResponse>(`${this.#authUrl}/google`, userGoogle).pipe(
      map((resp) => {
        this.#logged = signal(true);
        localStorage.setItem('token', resp.accessToken);
        return resp;
      })
    );
  }

  loginFacebook(userFacebook: UserFacebook) : Observable<TokenResponse> {
    return this.#http.post<TokenResponse>(`${this.#authUrl}/facebook`, userFacebook).pipe(
      map((resp) => {
        this.#logged = signal(true);
        localStorage.setItem('token', resp.accessToken);
        return resp;
      })
    );
  }

  isLogged(): Observable<boolean> {
    if (!this.#logged() && !localStorage.getItem('token')) {
      return of(false);
    } else if (!this.#logged() && localStorage.getItem('token')) {
      return this.#http.get<Observable<boolean>>(`${this.#authUrl}/validate`).pipe(
        map(() => {
          this.#logged = signal(true);
          return true;
        }),
        catchError(() => {
          localStorage.removeItem('token');
          this.#logged = signal(false);
          return of(false);
        })
      );
    }
    return of(true);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.#logged = signal(false);
  }
}
