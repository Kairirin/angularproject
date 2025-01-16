import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncodeBase64Directive } from '../../shared/directives/encode-base64.directive';
import { ValidationClassesDirective } from '../../shared/directives/validation-classes.directive';
import { GaAutocompleteDirective } from '../../shared/ol-maps/ga-autocomplete.directive';
import { OlMapDirective } from '../../shared/ol-maps/ol-map.directive';
import { OlMarkerDirective } from '../../shared/ol-maps/ol-marker.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { SearchResult } from '../../shared/ol-maps/search-result';
import { minDateValidator } from '../../shared/validators/min-date.validator';
import { MyEvent, MyEventInsert } from '../interfaces/my-event';
import { EventsService } from '../services/events.service';
import { Title } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../shared/modals/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../shared/modals/alert-modal/alert-modal.component';

@Component({
  selector: 'event-edit',
  imports: [ReactiveFormsModule, EncodeBase64Directive, ValidationClassesDirective, DatePipe, OlMapDirective, OlMarkerDirective, GaAutocompleteDirective],
  templateUrl: './event-edit.component.html',
  styleUrl: './event-edit.component.css'
})
export class EventEditComponent {
  #eventsService = inject(EventsService);
  #modalService = inject(NgbModal);
  #destroyRef = inject(DestroyRef);
  #fb = inject(NonNullableFormBuilder);
  #router = inject(Router);
  #title = inject(Title);
  saved = false;

  event = input.required<MyEvent>();

  minDate = new Date().toISOString().slice(0, 10);
  coordinates = signal<[number, number]>([0, 0]);
  
  editForm = this.#fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    image: ['', [Validators.required]],
    date: ['', [Validators.required, minDateValidator(this.minDate)]]
  })
  
  address = '';
  imgBase64 = '';

  constructor() {
    effect(() => {
      if (this.event()) {
        this.#title.setTitle(this.event().title + ' | Edit');
        this.editForm.get('title')!.setValue(this.event().title);
        this.editForm.get('description')!.setValue(this.event().description);
        this.editForm.get('price')!.setValue(this.event().price);
        this.editForm.get('date')!.setValue((this.event().date).split(" ")[0]);
        this.imgBase64 = this.event().image;
        this.address = this.event().address;
        this.coordinates.set([this.event().lng, this.event().lat]);
      }
    }); 
  }

  editEvent() {
    const newEvent: MyEventInsert = {
      ...this.editForm.getRawValue(),
      lat: this.coordinates()[1],
      lng: this.coordinates()[0],
      address: this.address,
      image: this.imgBase64
    };

    this.#eventsService.editEvent(newEvent, this.event().id)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.saved = true;
          this.#router.navigate(['/events']);
        },
        error: (error) => this.showModal(error.error.message)
      });
  }

  changePlace(result: SearchResult) {
    this.coordinates.set(result.coordinates);
    this.address = result.address;
  }

  canDeactivate() {
    if (this.saved || this.editForm.pristine) {
      this.#router.navigate(['/auth/login']);
    }
    const modalRef = this.#modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Leaving the page';
    modalRef.componentInstance.body = 'Are you sure? The changes will be lost...';
    return modalRef.result.catch(() => false);
  }

  showModal(message: string) {
    const modalRef = this.#modalService.open(AlertModalComponent);
    modalRef.componentInstance.title = 'Oopss... Incorrect login';
    modalRef.componentInstance.body = message;
  }
}
