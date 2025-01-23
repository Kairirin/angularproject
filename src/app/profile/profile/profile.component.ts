import { ChangeDetectorRef, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { User, UserPasswordEdit, UserPhotoEdit, UserProfileEdit } from '../../shared/interfaces/user';
import { OlMapDirective } from '../../shared/ol-maps/ol-map.directive';
import { OlMarkerDirective } from '../../shared/ol-maps/ol-marker.directive';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationClassesDirective } from '../../shared/directives/validation-classes.directive';
import { UsersService } from '../services/users.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { matchValues } from '../../shared/validators/match-values.Validator';
import { AlertModalComponent } from '../../shared/modals/alert-modal/alert-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CropperComponent } from '../../shared/cropper/cropper.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faLocationDot, faCameraRetro } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'profile',
  imports: [RouterLink, ReactiveFormsModule, ValidationClassesDirective, OlMapDirective, OlMarkerDirective, ValidationClassesDirective, CropperComponent, FaIconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  #title = inject(Title);
  #userService = inject(UsersService);
  #destroyRef = inject(DestroyRef);
  #modalService = inject(NgbModal);
  #changeDetector = inject(ChangeDetectorRef);
  user = input.required<User>();
  editProfile = signal(false);
  editPassword = signal(false);
  imageUpload = signal<Event | null>(null);
  imgBase64 = '';
  icons = { faLocationDot, faCameraRetro };

  profileForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  })

  passwordForm = new FormGroup({
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    password2: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  }, { validators: matchValues('password', 'password2') })

  constructor() {
    effect(() => {
      if (this.user()) {
        this.#title.setTitle(this.user().name + '\'s profile | Angular Events');

        this.profileForm.get('name')!.setValue(this.user().name);
        this.profileForm.get('email')!.setValue(this.user().email);
      }
    });
  }

  runCropper(event: Event) {
    this.imageUpload.set(event);
  } 

  changeButton(type: string) {
    switch (type) {
      case "profile":
        this.editProfile.update((edit) => !edit);
        break;
      case "password":
        this.editPassword.update((edit) => !edit);
        break;
    }
  }

  updateProfile() {
    const userProfile: UserProfileEdit = {
      ...this.profileForm.getRawValue()
    }

    this.#userService.saveProfile(userProfile)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.user().name = userProfile.name;
        this.user().email = userProfile.email;
        this.showModal("Profile updated");
        this.changeButton("profile");
      })
  }

  updatePassword() {
    const userPassword: UserPasswordEdit = {
      password: this.passwordForm.get("password")?.getRawValue()
    };

    this.#userService.savePassword(userPassword)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.user().password = userPassword.password;
        this.showModal("Password updated");
        this.passwordForm.reset();
        this.changeButton("password");
      })
  }

  changeAvatar() {
    const userPhoto: UserPhotoEdit = {
      avatar: this.imgBase64
    }

    this.#userService.saveAvatar(userPhoto)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.user().avatar = userPhoto.avatar;
          this.#changeDetector.markForCheck();
          this.imageUpload.set(null);
        }
      });
  }

  showModal(body: string) {
    const modalRef = this.#modalService.open(AlertModalComponent);
    modalRef.componentInstance.title = 'Done!';
    modalRef.componentInstance.body = body;
  }
}
