import { Component, inject, DestroyRef, effect, signal } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { EncodeBase64Directive } from "../../shared/directives/encode-base64.directive";
import { ValidationClassesDirective } from "../../shared/directives/validation-classes.directive";
import { matchValues } from "../../shared/validators/match-values.Validator";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { from } from "rxjs";
import { MyGeolocation } from "../../shared/my-geolocation";
import { User } from "../../shared/interfaces/user";
import { AuthService } from "../services/auth.service";
import { Coordinates } from "../../shared/interfaces/coordinates";
import { CanComponentDeactivate } from "../../shared/guards/leave-page.guard";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmModalComponent } from "../../shared/modals/confirm-modal/confirm-modal.component";
import { AlertModalComponent } from "../../shared/modals/alert-modal/alert-modal.component";
import { LoadButtonComponent } from "../../shared/load-button/load-button.component";

@Component({
  selector: 'register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, EncodeBase64Directive, ValidationClassesDirective, LoadButtonComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements CanComponentDeactivate {
  #authService = inject(AuthService);
  #modalService = inject(NgbModal);
  #router = inject(Router);
  #destroyRef = inject(DestroyRef);
  actualGeolocation = toSignal(from(MyGeolocation.getLocation().then((result) => result)));
  saved = false;
  imageBase64 = '';
  loading = signal(false);

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
    }, { validators: matchValues('email', 'email2') }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)]
    }),
    avatar: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    lat: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    lng: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required]
    }),
  })

  constructor() {
    effect(() => {
      const coords: Coordinates = {
        latitude: this.actualGeolocation()?.latitude ?? 0,
        longitude: this.actualGeolocation()?.longitude ?? 0
      }

      if (coords) {
        this.registerForm.get('lat')!.setValue(coords.latitude);
        this.registerForm.get('lng')!.setValue(coords.longitude);
      }
    });
  }

  register() {
    this.loading.set(!this.loading());
    const emailGroup = this.registerForm.get('emailGroup')!.getRawValue();
    const newUser: User = {
      name: this.registerForm.get('name')!.getRawValue(),
      email: emailGroup['email'],
      password: this.registerForm.get('password')!.getRawValue(),
      avatar: this.imageBase64,
      lat: this.registerForm.get('lat')!.getRawValue(),
      lng: this.registerForm.get('lng')!.getRawValue()
    };

    this.#authService.register(newUser)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.saved = true;
          this.#router.navigate(['/auth/login']);
        },
        error: (error) => this.showModal(error.error.message)
      });
  }

  canDeactivate() {
    if (this.saved || this.registerForm.pristine) {
      return true;
    }
    const modalRef = this.#modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Leaving the page';
    modalRef.componentInstance.body = 'Are you sure? The changes will be lost...';
    return modalRef.result.catch(() => false);
  }

  showModal(message: string) {
    const modalRef = this.#modalService.open(AlertModalComponent);
    modalRef.componentInstance.title = 'Oopss... Something went wrong';
    modalRef.componentInstance.body = message;
    this.loading.set(false);
  }
}
