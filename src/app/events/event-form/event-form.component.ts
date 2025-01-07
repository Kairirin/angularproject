import { DatePipe } from "@angular/common";
import { Component, inject, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { EncodeBase64Directive } from "../../shared/directives/encode-base64.directive";
import { ValidationClassesDirective } from "../../shared/directives/validation-classes.directive";
import { minDateValidator } from "../../shared/validators/min-date.validator";
import { MyEventInsert } from "../interfaces/my-event";
import { EventsService } from "../services/events.service";


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
    const newEvent: MyEventInsert = {
      ...this.eventForm.getRawValue(),
      lat: 0,
      lng: 0,
      address: '', //TODO: Modificar bien esto luego
      image: this.imgBase64
    };

    this.#eventsService.addEvent(newEvent)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.saved = true;
        this.#router.navigate(['/events']);
      });
  }

  //TODO: Tengo ya hechos todos los imports de mapas etc

/*   <ol-map [coordinates]="coordinates()">
  <ga-autocomplete (locationChange)="changePlace($event)"></ga-autocomplete>
  <ol-marker [coordinates]="coordinates()"></ol-marker>
</ol-map>

@Component({
  //..
  imports: [OlMapDirective, OlMarkerDirective, GaAutocompleteDirective],
  //...
})
export class AppComponent {
  //...
  coordinates = signal<[number, number]>([-0.5, 38.5]);

  changePlace(result: SearchResult) {
    this.coordinates.set(result.coordinates);
    console.log(result.address); // Habría que guardarlo
  }
} */

  canDeactivate() {
    return this.saved || this.eventForm.pristine || confirm('Are you sure? The changes will be lost...');
  }
}
