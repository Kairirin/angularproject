import { Component, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { User } from '../../shared/interfaces/user';

@Component({
  selector: 'profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  #title = inject(Title);
  user = input.required<User>();

  constructor(){
    effect(() => {
      this.#title.setTitle(this.user().name + '\'s profile | Angular Events');

    });
  }
}
