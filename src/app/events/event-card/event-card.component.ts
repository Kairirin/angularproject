import { DatePipe, NgClass } from "@angular/common";
import { Component, input, output, inject, DestroyRef, ChangeDetectorRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { IntlCurrencyPipe } from "../../shared/pipes/intl-currency.pipe";
import { MyEvent } from "../interfaces/my-event";
import { EventsService } from "../services/events.service";

@Component({
  selector: 'event-card',
  standalone: true,
  imports: [NgClass, DatePipe, IntlCurrencyPipe, RouterLink],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent {
  event = input.required<MyEvent>();
  deleted = output<void>();
  newAttendance = output<void>();
  #eventsService = inject(EventsService);
  #destroyRef = inject(DestroyRef);
  #changeDetector = inject(ChangeDetectorRef);

    attendEvent() {
      const attending = this.event().attend;
      console.log(this.event());
      if (!this.event().attend) {
        this.event().attend = true;
        this.event().numAttend++;

        this.#eventsService.postAttend(this.event().id)
          .pipe(takeUntilDestroyed(this.#destroyRef))
          .subscribe({
            next: () => {
              console.log("Bien"); //TODO: Borrar todos los console.log
              this.newAttendance.emit();
            },
            error: () => {
              console.log("Mal");
              this.event().attend = attending;
              this.#changeDetector.markForCheck(); //TODO: No sé si hace falta
            },
          });
      }
      else {
        this.event().attend = false;
        this.event().numAttend--;

        this.#eventsService.deleteAttend(this.event().id)
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe({
          next: () => {
            console.log("Bien"); 
            this.newAttendance.emit();
          },
          error: () => {
            console.log("Mal");
            this.event().attend = attending;
            this.#changeDetector.markForCheck();
          },
        });
      }
    }

    //TODO: Falta edit

  deleteEvent() {
    if (confirm('Are you sure you want to delete?')) //TODO: ngBootstrap o ngx-sweetalert2
      this.#eventsService.deleteEvent(this.event().id!)
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe(() => {
          this.deleted.emit();
        })
  }
}
