import { Component, DestroyRef, effect, inject } from "@angular/core";
import { FormControl, FormGroup,ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ValidationClassesDirective } from "../../shared/directives/validation-classes.directive";
import { AuthService } from "../services/auth.service";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { from } from "rxjs";
import { MyGeolocation } from "../my-geolocation";
import { UserLogin } from "../../shared/interfaces/user";
import { Coordinates } from "../../shared/interfaces/coordinates";

@Component({
    selector: 'login',
    standalone: true,
    imports: [ReactiveFormsModule, ValidationClassesDirective],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
  #router = inject(Router);
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  geolocation = toSignal(from(MyGeolocation.getLocation().then()));

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

  construct(){
    effect(() => {
      const coords: Coordinates = {
        latitude: this.geolocation()?.latitude ?? 0,
        longitude: this.geolocation()?.longitude ?? 0
      } //TODO: Tampoco coge las coordenadas, arreglar

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
    .subscribe(() => {
      this.#router.navigate(['/events']);
    })
  }
}
