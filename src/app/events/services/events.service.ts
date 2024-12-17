import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MyEvent, MyEventInsert } from '../interfaces/my-event';
import { EventsResponse, SingleEventResponse } from '../../shared/interfaces/responses';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  #eventsUrl = 'events';
  #http = inject(HttpClient);

   getEvents(page = 1, order = "distance", search = "", creator?: string): Observable<MyEvent[]> {
    let params;
    if (creator)
      params = new URLSearchParams({ page: String(page), order, search, creator });
    else 
      params = new URLSearchParams({ page: String(page), order, search });

    return this.#http.get<EventsResponse>(`${this.#eventsUrl}?${params.toString()}`)
    .pipe(map((resp) => resp.events));
  }

   getEvent(id: number): Observable<MyEvent> {
    return this.#http.get<SingleEventResponse>(`${this.#eventsUrl}/${id}`)
      .pipe(map((resp) => resp.event));
  }

  addEvent(event: MyEventInsert): Observable<MyEventInsert> {
    return this.#http.post<SingleEventResponse>(this.#eventsUrl, event)
      .pipe(map((resp) => resp.event));
  }

  deleteEvent(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.#eventsUrl}/${id}`);
  }
}
