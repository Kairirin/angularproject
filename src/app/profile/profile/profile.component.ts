import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { User, UserPasswordEdit, UserPhotoEdit, UserProfileEdit } from '../../shared/interfaces/user';
import { OlMapDirective } from '../../shared/ol-maps/ol-map.directive';
import { OlMarkerDirective } from '../../shared/ol-maps/ol-marker.directive';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationClassesDirective } from '../../shared/directives/validation-classes.directive';
import { UsersService } from '../services/users.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'profile',
  imports: [RouterLink, ReactiveFormsModule, ValidationClassesDirective, OlMapDirective, OlMarkerDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  #title = inject(Title);
  #userService = inject(UsersService);
  #destroyRef = inject(DestroyRef);
  user = input.required<User>();
  editProfile = signal(false);
  editPassword = signal(false);

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

  userPassword: UserPasswordEdit = {
    password: ""
  }

  userPhoto: UserPhotoEdit = {
    avatar: ""
  }

  constructor() {
    effect(() => {
      if (this.user()) {
        this.#title.setTitle(this.user().name + '\'s profile | Angular Events');

        this.profileForm.get('name')!.setValue(this.user().name);
        this.profileForm.get('email')!.setValue(this.user().email);
      }
    });
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
        this.changeButton("profile");
      })
  }
}
