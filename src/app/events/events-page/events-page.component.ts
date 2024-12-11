import { FormsModule } from '@angular/forms';
import { Component, computed, inject, signal } from '@angular/core';
import { MyEvent } from '../interfaces/my-event';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventCardComponent } from '../event-card/event-card.component';
import { EventsService } from '../services/events.service';

@Component({
  selector: 'events-page',
  standalone: true,
  imports: [FormsModule, EventCardComponent],
  templateUrl: './events-page.component.html',
  styleUrl: './events-page.component.css',
})
export class EventsPageComponent {
  events = signal<MyEvent[]>([]);
  search = signal('');
  filteredEvents = computed(() => {
    const searchingBy = this.search()?.toLocaleLowerCase();
    return searchingBy ? this.events().filter((event) => event.title.toLocaleLowerCase().includes(searchingBy) || event.description.toLocaleLowerCase().includes(searchingBy)) : this.events();
  })
  #eventsService = inject(EventsService);

  constructor() {
    this.#eventsService.getEvents().pipe(takeUntilDestroyed()).subscribe((events) => this.events.set(events));
  }

  orderEventsByDate() {
    this.events.update((events) => [...events.toSorted((e1, e2) => e1.date.localeCompare(e2.date))]);
  }

  orderEventsByPrice() {
    this.events.update((events) => [...events.toSorted((e1, e2) => e1.price - e2.price)]);
  }

  deleteEvent(event: MyEvent) {
    this.events.update((events) => events.filter((e) => e !== event));
  }

  addEvent(newEvent: MyEvent) {
    this.events.update((events) => [...events, newEvent]);
  }
}
