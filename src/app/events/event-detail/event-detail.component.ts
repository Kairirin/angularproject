import { Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { EventCardComponent } from '../event-card/event-card.component';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Comment, MyEvent, NewComment } from '../interfaces/my-event';
import { OlMapDirective } from '../../shared/ol-maps/ol-map.directive';
import { OlMarkerDirective } from '../../shared/ol-maps/ol-marker.directive';
import { User } from '../../shared/interfaces/user';
import { EventsService } from '../services/events.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'event-detail',
  standalone: true,
  imports: [EventCardComponent, OlMapDirective, OlMarkerDirective, RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent {
  event = input.required<MyEvent>();
  attendees = signal<User[]>([]);
  comments = signal<Comment[]>([]);
  #router = inject(Router);
  #title = inject(Title);
  #eventsService = inject(EventsService);
  #destroyRef = inject(DestroyRef);

  commentForm = new FormGroup({
    comment: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  constructor() {
    effect(() => {
      if (this.event()) {
        this.#title.setTitle(this.event().title + ' | Angular Events');
        this.getAttendance();

        this.#eventsService.getComments(this.event().id)
          .pipe(takeUntilDestroyed(this.#destroyRef))
          .subscribe((result) => {
            this.comments.set(result);
          });
        }
    });
  }

  getAttendance() {
    this.#eventsService.getAttendees(this.event().id)
    .pipe(takeUntilDestroyed(this.#destroyRef))
    .subscribe((result) => {
      this.attendees.set(result);
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
        console.log("Bien"); 
        this.commentForm.reset(); //TODO: Comprobar que resetea formulario
        this.comments.update((com) => [...com, result])
      },
      error: () => {
        console.log("Mal");
      },
    });
  }

  deleteEvent() {
    this.#router.navigate(['/events']);
  }
  goBack() {
    this.#router.navigate(['/events']);
  }
}
