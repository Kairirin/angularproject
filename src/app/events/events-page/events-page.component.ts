import { Component, signal, inject, DestroyRef, effect } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { EventCardComponent } from "../event-card/event-card.component";
import { MyEvent } from "../interfaces/my-event";
import { EventsService } from "../services/events.service";
import { debounceTime, distinctUntilChanged } from "rxjs";


@Component({
    selector: 'events-page',
    standalone: true,
    imports: [ReactiveFormsModule, EventCardComponent],
    templateUrl: './events-page.component.html',
    styleUrl: './events-page.component.css'
})
export class EventsPageComponent {
  #eventsService = inject(EventsService);
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

  constructor() {
    effect(() => {
      this.#eventsService
        .getEvents(this.search()!, this.order(), this.page())
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe((resp) => {
          if(this.page() === 1)
            this.events.set(resp.events)
          else
            this.events.update((events) => [...events, ...resp.events])

          if(resp.more) {
            this.load.set(true);
          }
          else {
            this.load.set(false);
          }
        });
    });
  } 

  changeOrder(type: string){
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
