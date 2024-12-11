import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncodeBase64Directive } from '../../shared/directives/encode-base64.directive';
import { ValidationClassesDirective } from '../../shared/directives/validation-classes.directive';
import { Router } from '@angular/router';

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

  registerForm = new FormGroup({
    nameUser: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', { 
      nonNullable: true,
      validators: [Validators.required] 
    }),
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
}
