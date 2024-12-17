import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../auth/services/auth.service";


@Component({
    selector: 'top-menu',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './top-menu.component.html',
    styleUrl: './top-menu.component.css'
})
export class TopMenuComponent {
    token = signal(localStorage.getItem('token')); //TODO: CORREGIR QUE LO MUESTRE CUANDO TOCA Y CUANDO NO
    #authService = inject(AuthService);
    #router = inject(Router);

    logout() {
        this.#authService.logout();
        this.#router.navigate(['/auth/login']);
    }
}
