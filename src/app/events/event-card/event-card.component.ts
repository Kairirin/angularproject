import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { MyEvent } from '../interfaces/my-event';
import { DatePipe } from '@angular/common';
import { IntlCurrencyPipe } from '../../shared/pipes/intl-currency.pipe';
import { EventsService } from '../services/events.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

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
