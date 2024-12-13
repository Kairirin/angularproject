import { Component, inject, DestroyRef, effect } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { EncodeBase64Directive } from "../../shared/directives/encode-base64.directive";
import { ValidationClassesDirective } from "../../shared/directives/validation-classes.directive";
import { matchValues } from "../../shared/validators/match-values.Validator";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { from } from "rxjs";
import { MyGeolocation } from "../my-geolocation";
import { User } from "../../shared/interfaces/user";
import { AuthService } from "../services/auth.service";
import { Coordinates } from "../../shared/interfaces/coordinates";


@Component({
    selector: 'register',
    standalone: true,
    imports: [ReactiveFormsModule, EncodeBase64Directive, ValidationClassesDirective],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
  #authService = inject(AuthService);
  #router = inject(Router);
  saved = false;
  #destroyRef = inject(DestroyRef);
  imageBase64 = '';
  geolocation = toSignal(from(MyGeolocation.getLocation().then()));

  registerForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    emailGroup: new FormGroup({
      email: new FormControl('', { 
        nonNullable: true,
        validators: [Validators.required, Validators.email] 
      }),
      email2: new FormControl('', { 
        nonNullable: true,
        validators: [Validators.required, Validators.email] 
      }),
    }, { validators: matchValues ('email', 'email2') }), //TODO: No hace bien la validación
    password: new FormControl('', { 
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)] 
    }),
    avatar: new FormControl('', { 
      nonNullable: true,
      validators: [Validators.required] 
    }),
    lat:  new FormControl(0, { 
      nonNullable: true,
      validators: [Validators.required] 
    }),
    lng:  new FormControl(0, { 
      nonNullable: true,
      validators: [Validators.required] 
    }),
  })

  constructor() {
    effect(() => {
      const coords: Coordinates = {
        latitude: this.geolocation()?.latitude ?? 0,
        longitude: this.geolocation()?.longitude ?? 0
      } 

      if (coords) {
        this.registerForm.get('lat')!.setValue(coords.latitude);
        this.registerForm.get('lng')!.setValue(coords.longitude);
      }
    });
  }

  register() {
    const emailGroup = this.registerForm.get('emailGroup')!.getRawValue();
    const newUser: User = {
      ...this.registerForm.getRawValue(),
      email: emailGroup['email'],
      avatar: this.imageBase64
    };

    this.#authService.register(newUser)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.saved = true;
        this.#router.navigate(['/login']);
      });
  }
}
