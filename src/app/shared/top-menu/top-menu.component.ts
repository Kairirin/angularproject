import { ChangeDetectorRef, Component, computed,  effect,  inject, signal } from "@angular/core";
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
    #authService = inject(AuthService);
    logged = signal(this.#authService.getLogged());
    #changeDetector = inject(ChangeDetectorRef);
/*     logged = signal<boolean>(false); */
    #router = inject(Router);
    showMenu = computed(() => {
        return this.logged();
    })

    constructor() {
        effect(() => {
            this.#authService.isLogged() //TODO: No va bien
            .subscribe({
                next: (resp) => {
                    this.logged.set(resp);
                    this.#changeDetector.markForCheck();
                }
            })
        })
    }

    logout() {
        this.#authService.logout(); 
        this.#router.navigate(['/auth/login']);
    }
}
