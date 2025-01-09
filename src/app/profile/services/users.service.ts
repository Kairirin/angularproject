import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AvatarResponse, SingleUserResponse } from '../../shared/interfaces/responses';
import { User } from '../../shared/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  #usersUrl = 'users';
  #http = inject(HttpClient);

  getProfile(id?: number): Observable<User> {
    if(id){
      return this.#http.get<SingleUserResponse>(`${this.#usersUrl}/${id}`)
        .pipe(map((resp)=> resp.user));
    }
    return this.#http.get<SingleUserResponse>(`${this.#usersUrl}/me`)
        .pipe(map((resp)=> resp.user));
  }

  saveAvatar(avatar: string): Observable<string> {
    return this.#http.put<AvatarResponse>(`${this.#usersUrl}/me/photo`, avatar)
    .pipe(map((resp)=> resp.avatar));
  } //TODO: Mirar servicios Proyecto1 si no funciona

  saveProfile(name: string, email: string): Observable<void> {
    return this.#http.put<void>(`${this.#usersUrl}/me`, { name: name, email: email });
  } //TODO: Mirar servicios Proyecto1 si no funciona

  savePassword(password: string): Observable<void> {
    return this.#http.put<void>(`${this.#usersUrl}/me/password`, { password: password });
  } //TODO: Mirar servicios Proyecto1 si no funciona
}
