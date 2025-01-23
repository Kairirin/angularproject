import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationClassesDirective } from '../../shared/directives/validation-classes.directive';
import { AuthService } from '../services/auth.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { MyGeolocation } from '../../shared/my-geolocation';
import { UserFacebook, UserGoogle, UserLogin } from '../../shared/interfaces/user';
import { GoogleLoginDirective } from '../google-login/google-login.directive';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FbLoginDirective } from '../facebook-login/fb-login.directive';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Coordinates } from '../../shared/interfaces/coordinates';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../../shared/modals/alert-modal/alert-modal.component';
import { LoadButtonComponent } from '../../shared/load-button/load-button.component';

@Component({
  selector: 'login',
  standalone: true,
  imports: [ ReactiveFormsModule, ValidationClassesDirective, GoogleLoginDirective, FbLoginDirective, FaIconComponent, LoadButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  #router = inject(Router);
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  #modalService = inject(NgbModal);
  loading = signal(false);
  actualGeolocation = toSignal(
    from(MyGeolocation.getLocation().then((result) => result))
  );
  iconFacebook = faFacebook;

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  userLogin: UserLogin = {
    email: '',
    password: '',
    lat: 0,
    lng: 0,
  };

  constructor() {
    effect(() => {
      const coords: Coordinates = {
        latitude: this.actualGeolocation()?.latitude ?? 0,
        longitude: this.actualGeolocation()?.longitude ?? 0,
      };

      if (coords) {
        this.userLogin.lat = coords.latitude;
        this.userLogin.lng = coords.longitude;
      }
    });
  }

  login() {
    this.userLogin.email = this.loginForm.get('email')?.getRawValue();
    this.userLogin.password = this.loginForm.get('password')?.getRawValue();

    this.#authService
      .login(this.userLogin)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => this.#router.navigate(['/events']),
        error: (error) => this.showModal(error.error.message),
      });
  }

  loginGoogle(resp: google.accounts.id.CredentialResponse) {
    const userGoogle: UserGoogle = {
      token: resp.credential,
      lat: this.userLogin.lat,
      lng: this.userLogin.lng,
    };

    this.#authService
      .loginGoogle(userGoogle)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => this.#router.navigate(['/events']),
        error: (error) => this.showModal(error.error.message),
      });
  }

  loginFacebook(resp: fb.StatusResponse) {
    const userFacebook: UserFacebook = {
      token: resp.authResponse.accessToken!,
      lat: this.userLogin.lat,
      lng: this.userLogin.lng,
    };

    this.#authService
      .loginFacebook(userFacebook)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => this.#router.navigate(['/events']),
        error: (error) => this.showModal(error.error.message),
      });
  }

  showError(error: string) {
    console.error(error);
  }

  showModal(message: string) {
    const modalRef = this.#modalService.open(AlertModalComponent);
    modalRef.componentInstance.title = 'Oopss... Incorrect login';
    modalRef.componentInstance.body = message;
    this.loading.set(false);
  }
}
