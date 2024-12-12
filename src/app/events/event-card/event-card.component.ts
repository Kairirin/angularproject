import { DatePipe } from "@angular/common";
import { Component, input, output, inject, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { IntlCurrencyPipe } from "../../shared/pipes/intl-currency.pipe";
import { MyEvent } from "../interfaces/my-event";
import { EventsService } from "../services/events.service";


@Component({
    selector: 'event-card',
    standalone: true,
    imports: [DatePipe, IntlCurrencyPipe, RouterLink],
    templateUrl: './event-card.component.html',
    styleUrl: './event-card.component.css'
})
export class EventCardComponent {
  event = input.required<MyEvent>();
  deleted = output<void>();
  #eventsService = inject(EventsService);
  #destroyRef = inject(DestroyRef);

  deleteEvent(){
    this.#eventsService.deleteEvent(this.event().id!)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.deleted.emit();
      })
  }
}
