import { Component, DestroyRef, inject } from '@angular/core';
import { MyEvent } from '../interfaces/my-event';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncodeBase64Directive } from '../../shared/directives/encode-base64.directive';
import { EventsService } from '../services/events.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ValidationClassesDirective } from '../../shared/directives/validation-classes.directive';
import { minDateValidator } from '../../shared/validators/min-date.validator';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'event-form',
  standalone: true,
  imports: [ReactiveFormsModule, EncodeBase64Directive, ValidationClassesDirective, DatePipe],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css'
})
export class EventFormComponent {
  #eventsService = inject(EventsService);
  #router = inject(Router);
  saved = false;
  #destroyRef = inject(DestroyRef);
  #fb = inject(NonNullableFormBuilder);

  minDate = new Date().toISOString().slice(0,10);

  eventForm = this.#fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    image: ['', [Validators.required]],
    date: ['', [Validators.required, minDateValidator(this.minDate)]]
  })

  imgBase64 = '';

  addEvent() {
    const newEvent: MyEvent = {
      ...this.eventForm.getRawValue(),
      image: this.imgBase64
    };

    this.#eventsService.addEvent(newEvent)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.saved = true;
        this.#router.navigate(['/events']);
      });
  }

  canDeactivate() {
    return this.saved || this.eventForm.pristine || confirm('Are you sure? The changes will be lost...');
  }
}
