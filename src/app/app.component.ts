import {  Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { TopMenuComponent } from "./shared/top-menu/top-menu.component";
import { trigger, transition, query, style, group, animate } from "@angular/animations";
import {SsrCookieService} from 'ngx-cookie-service-ssr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TopMenuComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [SsrCookieService],
  animations: [
    trigger('routeAnimation', [
      transition('eventsPage => others', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' })),
        query(':enter', style({ transform: 'translateX(100%)' })),
        group([
          query(':leave', [
            animate('0.4s', style({ transform: 'translateX(-100%)' })),
            animate('0.2s', style({ opacity: 0 }))
          ]),
          query(':enter', [animate('0.5s', style({ transform: 'none' }))]),
        ]),
      ]),
      transition('others => eventsPage', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' })),
        query(':enter', style({ transform: 'translateX(-100%)' })),
        group([
          query(':leave', [
            animate('0.4s', style({ transform: 'translateX(100%)' })),
            animate('0.2s', style({ opacity: 0 }))
          ]),
          query(':enter', [animate('0.5s', style({ transform: 'none' }))]),
        ]),
      ]),
      transition('eventsPage => eventDetail', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' })),
        query(':enter', style({ transform: 'scale(.3)', opacity: 0 })),
        group([
          query(':leave', [
            animate('0.4s', style({ transform: 'scale(.5)' })),
            animate('0.2s', style({ opacity: 0 }))
          ]),
          query(':enter', [animate('0.5s', style({ transform: 'none', opacity: 1 }))]),
        ]),
      ]),
      transition('eventDetail => eventsPage', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' })),
        query(':enter', style({ transform: 'scale(.3)', opacity: 0 })),
        group([
          query(':leave', [
            animate('0.4s', style({ transform: 'scale(.5)' })),
            animate('0.2s', style({ opacity: 0 }))
          ]),
          query(':enter', [animate('0.5s', style({ transform: 'none', opacity: 1 }))]),
        ]),
      ]),
    ]),
  ],
})

export class AppComponent {
  title = 'angular-svtickets';

  getState(routerOutlet: RouterOutlet) {
    return routerOutlet.activatedRouteData['animation'] || 'None';
  }
}
