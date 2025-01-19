import { Component, signal, inject, DestroyRef, effect, input, computed } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { EventCardComponent } from "../event-card/event-card.component";
import { MyEvent } from "../interfaces/my-event";
import { EventsService } from "../services/events.service";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { UsersService } from "../../profile/services/users.service";


@Component({
  selector: 'events-page',
  standalone: true,
  imports: [ReactiveFormsModule, EventCardComponent],
  templateUrl: './events-page.component.html',
  styleUrl: './events-page.component.css'
})
export class EventsPageComponent {
  #eventsService = inject(EventsService);
  #usersService = inject(UsersService);
  #destroyRef = inject(DestroyRef);
  events = signal<MyEvent[]>([]);
  searchControl = new FormControl('');
  search = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
    ),
    { initialValue: '' }
  )

  order = signal("distance");
  page = signal(1);
  load = signal(false);
  username = signal('');
  creator = input<string>();
  attending = input<string>();
  info = computed(() => {
    let text = "Events ";
    if (this.username()) {
      text += ` created by ${this.username()}, `
    }
    if (this.search()) {
      text += ` filtered by ${this.search()}, `;
    }
    return text += `ordered by ${this.order()}`
  });

  constructor() {
    effect(() => {
      if (this.creator()) {
        this.getEventsByCreator();
      }
      else if (this.attending()) {
        this.getEventsByAttending();
      }
      else {
        this.username.set('');

        this.#eventsService
          .getEvents(this.search()!, this.order(), this.page())
          .pipe(takeUntilDestroyed(this.#destroyRef))
          .subscribe((resp) => {
            if (this.page() === 1)
              this.events.set(resp.events)
            else
              this.events.update((events) => [...events, ...resp.events])

            if (resp.more) {
              this.load.set(true);
            }
            else {
              this.load.set(false);
            }
          });
      }
    });
  }

  getEventsByCreator() {
    this.#eventsService
      .getEvents(this.search()!, this.order(), this.page(), this.creator()!)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((resp) => {
        if (this.page() === 1)
          this.events.set(resp.events)
        else
          this.events.update((events) => [...events, ...resp.events])

        if (resp.more) {
          this.load.set(true);
        }
        else {
          this.load.set(false);
        }
      }); //TODO: Mejorar esto.

    this.#usersService.getProfile(Number(this.creator()))
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((resp) => this.username.set(resp.name));
  }

  getEventsByAttending() {
    this.#eventsService
      .getEventsAttending(this.search()!, this.order(), this.page(), this.attending()!)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((resp) => {
        if (this.page() === 1)
          this.events.set(resp.events)
        else
          this.events.update((events) => [...events, ...resp.events])

        if (resp.more) {
          this.load.set(true);
        }
        else {
          this.load.set(false);
        }
      });
  }

  changeOrder(type: string) {
    this.page.set(1);
    this.order.set(type);
  }

  loadMore() {
    this.page.update((page) => ++page);
  }

  deleteEvent(event: MyEvent) {
    this.events.update((events) => events.filter((e) => e !== event));
  }

  addEvent(newEvent: MyEvent) {
    this.events.update((events) => [...events, newEvent]);
  }
}
