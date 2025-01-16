import { DatePipe } from "@angular/common";
import { Component, inject, DestroyRef, signal, effect } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { EncodeBase64Directive } from "../../shared/directives/encode-base64.directive";
import { ValidationClassesDirective } from "../../shared/directives/validation-classes.directive";
import { minDateValidator } from "../../shared/validators/min-date.validator";
import { MyEventInsert } from "../interfaces/my-event";
import { EventsService } from "../services/events.service";
import { GaAutocompleteDirective } from "../../shared/ol-maps/ga-autocomplete.directive";
import { OlMapDirective } from "../../shared/ol-maps/ol-map.directive";
import { OlMarkerDirective } from "../../shared/ol-maps/ol-marker.directive";
import { SearchResult } from "../../shared/ol-maps/search-result";
import { MyGeolocation } from "../../shared/my-geolocation";
import { from } from "rxjs";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmModalComponent } from "../../shared/modals/confirm-modal/confirm-modal.component";
import { LoadButtonComponent } from "../../shared/load-button/load-button.component";


@Component({
  selector: 'event-form',
  standalone: true,
  imports: [ReactiveFormsModule, EncodeBase64Directive, ValidationClassesDirective, DatePipe, OlMapDirective, OlMarkerDirective, GaAutocompleteDirective, LoadButtonComponent],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css'
})
export class EventFormComponent {
  #eventsService = inject(EventsService);
  #modalService = inject(NgbModal);
  #router = inject(Router);
  saved = false;
  #destroyRef = inject(DestroyRef);
  #fb = inject(NonNullableFormBuilder);
  loading = signal(false);

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

  constructor() {
    effect(() => {
      this.coordinates.set([this.actualGeolocation()[0], this.actualGeolocation()[1]]);
    });
  }

  addEvent() {
    const newEvent: MyEventInsert = {
      ...this.eventForm.getRawValue(),
      lat: this.coordinates()[1],
      lng: this.coordinates()[0],
      address: this.address,
      image: this.imgBase64
    };

    this.#eventsService.addEvent(newEvent)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.saved = true;
        this.#router.navigate(['/events']);
      });
  }

  changePlace(result: SearchResult) {
    this.coordinates.set(result.coordinates);
    this.address = result.address;
  }

  canDeactivate() {
    if (this.saved || this.eventForm.pristine) {
      this.#router.navigate(['/auth/login']);
    }
    const modalRef = this.#modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Leaving the page';
    modalRef.componentInstance.body = 'Are you sure? The changes will be lost...';
    return modalRef.result.catch(() => false);
  }
}
