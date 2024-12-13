import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User, UserLogin } from '../../shared/interfaces/user';
import { map, Observable } from 'rxjs';
import { SingleUserResponse, TokenResponse } from '../../shared/interfaces/responses';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  #authUrl = 'auth';
  #http = inject(HttpClient);

  register(user: User):  Observable<User> {
    return this.#http.post<SingleUserResponse>(`${this.#authUrl}/register`, user).pipe(map((resp) => resp.user));
  }

  login(user: UserLogin): Observable<TokenResponse> {
    return this.#http.post<TokenResponse>(`${this.#authUrl}/login`, user).pipe(map((resp) => resp));
  }

  checkToken(): Observable<void> {
    return this.#http.get<void>(`${this.#authUrl}/validate`).pipe(map((resp) => resp));
  } //TODO: CREO QUE ESTE MÉTODO NO HACE FALTA PORQUE YA VALIDARÁ EL GUARD

  logout(): void {
    localStorage.removeItem('token');
  } //TODO: ESTE MÉTODO LO HE PUESTO TAL CUAL EL OTRO PROYECTO. COMPROBAR
}