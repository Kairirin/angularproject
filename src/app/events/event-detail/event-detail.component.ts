import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { EventCardComponent } from '../event-card/event-card.component';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MyEvent, NewComment } from '../interfaces/my-event';
import { OlMapDirective } from '../../shared/ol-maps/ol-map.directive';
import { OlMarkerDirective } from '../../shared/ol-maps/ol-marker.directive';
import { EventsService } from '../services/events.service';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../../shared/modals/alert-modal/alert-modal.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'event-detail',
  standalone: true,
  imports: [EventCardComponent, OlMapDirective, OlMarkerDirective, RouterLink, ReactiveFormsModule, DatePipe, FaIconComponent],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent {
  #router = inject(Router);
  #title = inject(Title);
  #eventsService = inject(EventsService);
  #modalService = inject(NgbModal);
  #destroyRef = inject(DestroyRef);
  event = input.required<MyEvent>();
  icons = { faLocationDot };
  newAttendance = signal<boolean>(true);
  attendResource = rxResource({
    request: () => this.event().id,
    loader: ({request: id}) => this.#eventsService.getAttendees(id)
  })
  attendees = computed(() => this.attendResource.value());

  commentResource = rxResource({
    request: () => this.event().id,
    loader: ({request: id}) => this.#eventsService.getComments(id)
  })
  comments = computed(() => this.commentResource.value());

  commentForm = new FormGroup({
    comment: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  constructor() {
    effect(() => {
      this.#title.setTitle(this.event().title + ' | Angular Events');
    });
  }

  getAttendance() {
    this.#eventsService.getAttendees(this.event().id)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((result) => {
        this.attendResource.set(result);
      });
  }

  addComment() {
    const newComment: NewComment = {
      comment: this.commentForm.get('comment')!.getRawValue()
    }

    this.#eventsService.addComment(this.event().id, newComment)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (result) => {
          this.commentForm.reset();
          const com = this.comments();
          this.commentResource.set([...com!, result])
        },
        error: () => {
          const modalRef = this.#modalService.open(AlertModalComponent);
          modalRef.componentInstance.title = 'Wait a minute!';
          modalRef.componentInstance.body = 'You can not comment on events that you are not attending!';
          this.commentForm.reset();
        },
      });
  }

  goBack() {
    this.#router.navigate(['/events']);
  }
}
