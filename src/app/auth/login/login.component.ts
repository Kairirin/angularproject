import { Component, DestroyRef, effect, inject } from "@angular/core";
import { FormControl, FormGroup,ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ValidationClassesDirective } from "../../shared/directives/validation-classes.directive";
import { AuthService } from "../services/auth.service";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { from } from "rxjs";
import { MyGeolocation } from "../../shared/my-geolocation";
import { UserLogin } from "../../shared/interfaces/user";
import { GoogleLoginDirective } from "../google-login/google-login.directive";
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FbLoginDirective } from "../facebook-login/fb-login.directive";
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Coordinates } from "../../shared/interfaces/coordinates";

@Component({
    selector: 'login',
    standalone: true,
    imports: [ReactiveFormsModule, ValidationClassesDirective, GoogleLoginDirective, FbLoginDirective, FaIconComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
  #router = inject(Router);
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  actualGeolocation = toSignal(from(MyGeolocation.getLocation().then((result) => result)));
  iconFacebook = faFacebook;

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  userLogin: UserLogin = {
    email: '',
    password: '',
    lat: 0,
    lng: 0
  }

  constructor(){
    effect(() => {
      const coords: Coordinates = {
        latitude: this.actualGeolocation()?.latitude ?? 0,
        longitude: this.actualGeolocation()?.longitude ?? 0
      }

      if (coords) {
        this.userLogin.lat = coords.latitude;
        this.userLogin.lng = coords.longitude;
      }
    });
  }
  
  login(){
    this.userLogin.email = this.loginForm.get('email')?.getRawValue();
    this.userLogin.password = this.loginForm.get('password')?.getRawValue();
    
    this.#authService.login(this.userLogin)
    .pipe(takeUntilDestroyed(this.#destroyRef))
    .subscribe({
      next: () => this.#router.navigate(['/events']),
      error: () => alert("Login incorrecto")//TODO: Mostrar error en modal
    });
  }

  loggedGoogle(resp: google.accounts.id.CredentialResponse) {
    localStorage.setItem('token', resp.credential);
    this.#router.navigate(['/events']); //TODO: ARREGLAR ESTO CON TODO LO DE PROFILE Y TAL
    /* console.log(resp.credential); */
  }

  loggedFacebook(resp: fb.StatusResponse) {
    // Envía esto a tu API
/*     localStorage.setItem('token', resp.authResponse.accessToken!);
    this.#router.navigate(['/events']); */ //TODO: ARREGLAR ESTO BIEN
    console.log(resp.authResponse.accessToken);
  }

  showError(error: string) {
    console.error(error);
  }
}
