import { DatePipe } from "@angular/common";
import { Component, inject, DestroyRef, signal, effect, input } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ValidationClassesDirective } from "../../shared/directives/validation-classes.directive";
import { minDateValidator } from "../../shared/validators/min-date.validator";
import { MyEvent, MyEventInsert } from "../interfaces/my-event";
import { EventsService } from "../services/events.service";
import { GaAutocompleteDirective } from "../../shared/ol-maps/ga-autocomplete.directive";
import { OlMapDirective } from "../../shared/ol-maps/ol-map.directive";
import { OlMarkerDirective } from "../../shared/ol-maps/ol-marker.directive";
import { SearchResult } from "../../shared/ol-maps/search-result";
import { MyGeolocation } from "../../shared/my-geolocation";
import { from } from "rxjs";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmModalComponent } from "../../shared/modals/confirm-modal/confirm-modal.component";
import { AlertModalComponent } from "../../shared/modals/alert-modal/alert-modal.component";
import { Title } from "@angular/platform-browser";
import { LoadButtonComponent } from "../../shared/load-button/load-button.component";
import { CropperComponent } from "../../shared/cropper/cropper.component";


@Component({
  selector: 'event-form',
  standalone: true,
  imports: [ReactiveFormsModule, ValidationClassesDirective, DatePipe, OlMapDirective, OlMarkerDirective, GaAutocompleteDirective, LoadButtonComponent, CropperComponent],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css'
})
export class EventFormComponent {
  #eventsService = inject(EventsService);
  #modalService = inject(NgbModal);
  #destroyRef = inject(DestroyRef);
  #router = inject(Router);
  #fb = inject(NonNullableFormBuilder);
  #title = inject(Title);
  event = input.required<MyEvent | null>();
  loading = signal(false);
  disabledButton = signal(false);

  saved = false;

  minDate = new Date().toISOString().slice(0, 10);
  actualGeolocation = toSignal(from(MyGeolocation.getLocation().then((result) => [result.longitude, result.latitude])), { initialValue: [0, 0] });
  coordinates = signal<[number, number]>([0, 0]);

  eventForm = this.#fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    image: ['', [Validators.required]],
    date: ['', [Validators.required, minDateValidator(this.minDate)]]
  })

  address = "";
  imgBase64 = '';
  imageUpload = signal<Event | null>(null);

  constructor() {
    effect(() => {
      if (this.event()) {
        this.#title.setTitle(this.event()!.title + ' | Edit');
        this.eventForm.get('title')!.setValue(this.event()!.title);
        this.eventForm.get('description')!.setValue(this.event()!.description);
        this.eventForm.get('price')!.setValue(this.event()!.price);
        this.eventForm.get('date')!.setValue((this.event()!.date).split(" ")[0]);
        this.imgBase64 = this.event()!.image;
        this.address = this.event()!.address;
        this.coordinates.set([this.event()!.lng, this.event()!.lat]);
        this.eventForm.updateValueAndValidity;
      }
      else {
        this.coordinates.set([this.actualGeolocation()[0], this.actualGeolocation()[1]]);
        this.disabledButton.set(true);
      }
    });
  }

  runCropper(event: Event) {
    this.imageUpload.set(event);
  }

  sendEvent() {
    this.loading.set(!this.loading());
    const newEvent: MyEventInsert = {
      ...this.eventForm.getRawValue(),
      lat: this.coordinates()[1],
      lng: this.coordinates()[0],
      address: this.address,
      image: this.imgBase64
    };

    if(this.event()){
      this.#eventsService.editEvent(newEvent, this.event()!.id)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.saved = true;
          this.#router.navigate(['/events']);
        },
        error: (error) => this.showModal(error.error.message)
      });
    }
    else {
      this.#eventsService.addEvent(newEvent)
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe({
          next: () => {
            this.saved = true;
            this.#router.navigate(['/events']);
          },
          error: (error) => this.showModal(error.error.message)
        });
    }
  }

  changePlace(result: SearchResult) {
    this.coordinates.set(result.coordinates);
    this.address = result.address;
  }

  canDeactivate() {
    if (this.saved || this.eventForm.pristine) {
      return true;
    }
    
    const modalRef = this.#modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Leaving the page';
    modalRef.componentInstance.body = 'Are you sure? The changes will be lost...';
    return modalRef.result.catch(() => false);
  }

  showModal(message: string) {
    const modalRef = this.#modalService.open(AlertModalComponent);
    modalRef.componentInstance.title = 'Oopss... Something went wrong';
    modalRef.componentInstance.body = message;
    this.loading.set(false);
  }
}
