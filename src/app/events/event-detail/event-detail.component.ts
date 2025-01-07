import {
  Component,
  effect,
  inject,
  input
} from '@angular/core';
import { EventCardComponent } from '../event-card/event-card.component';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MyEvent } from '../interfaces/my-event';
import { MapDisplayerComponent } from '../../shared/components/map-displayer/map-displayer.component';
import { OlMapDirective } from '../../shared/ol-maps/ol-map.directive';

@Component({
    selector: 'event-detail',
    standalone: true,
    imports: [EventCardComponent, MapDisplayerComponent, OlMapDirective],
    templateUrl: './event-detail.component.html',
    styleUrl: './event-detail.component.css'
})
export class EventDetailComponent {
  event = input.required<MyEvent>();
  #router = inject(Router);
  #title = inject(Title);

  constructor() {
    effect(() => {
      if (this.event())
        this.#title.setTitle(this.event().title + ' | Angular Events');
    });
  }

  deleteEvent() {
    this.#router.navigate(['/events']);
  }
  goBack() {
    this.#router.navigate(['/events']);
  }
}
