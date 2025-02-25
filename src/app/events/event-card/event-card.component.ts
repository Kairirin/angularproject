import { DatePipe, NgClass } from "@angular/common";
import { Component, input, output, inject, DestroyRef, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { IntlCurrencyPipe } from "../../shared/pipes/intl-currency.pipe";
import { MyEvent } from "../interfaces/my-event";
import { EventsService } from "../services/events.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmModalComponent } from "../../shared/modals/confirm-modal/confirm-modal.component";
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPeopleGroup, faThumbsUp, faThumbsDown, faTrashCan, faUserPen } from '@fortawesome/free-solid-svg-icons';
import { AlertModalComponent } from "../../shared/modals/alert-modal/alert-modal.component";

@Component({
  selector: 'event-card',
  standalone: true,
  imports: [ NgClass, DatePipe, IntlCurrencyPipe, RouterLink, FaIconComponent ],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent {
  event = input.required<MyEvent>();
  deleted = output<void>();
  newAttendance = output<void>();
  #eventsService = inject(EventsService);
  #destroyRef = inject(DestroyRef);
  #modalService = inject(NgbModal);
  icons = { faPeopleGroup, faThumbsUp, faThumbsDown, faTrashCan, faUserPen };

  attendEvent() {
    const attending = this.event().attend;
    const numberAux = this.event().numAttend;

    if (!this.event().attend) {
      this.event().attend = true;
      this.event().numAttend++;

      this.#eventsService.postAttend(this.event().id)
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe({
          next: () => {
            this.newAttendance.emit();
          },
          error: () => {
            this.event().attend = attending;
            this.event().numAttend = numberAux;
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
            this.newAttendance.emit();
          },
          error: () => {
            this.event().attend = attending;
            this.event().numAttend = numberAux;
          },
        });
    }
  }

  deleteEvent() {
    const modalRef = this.#modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Are you sure?';
    modalRef.componentInstance.body = 'You are going to delete this event';

    modalRef.result.then((result) => {
      if(result){
        this.#eventsService.deleteEvent(this.event().id!)
          .pipe(takeUntilDestroyed(this.#destroyRef))
          .subscribe({
            next: () => this.deleted.emit(),
            error: () => {
              const modalRef = this.#modalService.open(AlertModalComponent);
              modalRef.componentInstance.title = 'Oopss... Try again';
              modalRef.componentInstance.body = "The event could not be removed at this moment";
            }
          })
      }
      else
        return;
    });
  }
}
