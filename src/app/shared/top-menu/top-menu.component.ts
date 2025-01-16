import { Component, computed, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../auth/services/auth.service";
import { rxResource } from "@angular/core/rxjs-interop";

@Component({
    selector: 'top-menu',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './top-menu.component.html',
    styleUrl: './top-menu.component.css'
})
export class TopMenuComponent {
    #authService = inject(AuthService);
    #router = inject(Router);
    showMenu = computed(() => this.#authService.getLogged()());

/*     loggedResource = rxResource({
        request: () => this.#authService.getLogged(),
        loader: () => this.#authService.isLogged()
      });
    showMenu = computed(() => this.loggedResource.value()); */

    logout() {
        this.#authService.logout();
        this.#router.navigate(['/auth/login']);
    }
}