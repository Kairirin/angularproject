import { Component, inject, DestroyRef, effect } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { EncodeBase64Directive } from "../../shared/directives/encode-base64.directive";
import { ValidationClassesDirective } from "../../shared/directives/validation-classes.directive";
import { matchValues } from "../../shared/validators/match-values.Validator";
import { toSignal } from "@angular/core/rxjs-interop";
import { from } from "rxjs";
import { MyGeolocation } from "../my-geolocation";


@Component({
    selector: 'register',
    standalone: true,
    imports: [ReactiveFormsModule, EncodeBase64Directive, ValidationClassesDirective],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
  #router = inject(Router);
  saved = false;
  #destroyRef = inject(DestroyRef);
  imageBase64 = '';
  coords = toSignal(from(MyGeolocation.getLocation()));

  registerForm = new FormGroup({
    nameUser: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    emailGroup: new FormGroup({
      email: new FormControl('', { 
        nonNullable: true,
        validators: [Validators.required, Validators.email] 
      }),
      email2: new FormControl('', { 
        nonNullable: true 
      }),
    }, { validators: matchValues ('email', 'email2') }),
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
      this.registerForm.get('lat')!.setValue(coords.);
  }

  register() {
    console.log("hola");
  }
}
