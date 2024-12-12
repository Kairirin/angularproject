import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { TopMenuComponent } from "./shared/top-menu/top-menu.component";


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [TopMenuComponent, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-svtickets';
}
