import { Component, input } from '@angular/core';

@Component({
  selector: ' load-button, load-button[type=submit]',
  imports: [],
  templateUrl: './load-button.component.html',
  styleUrl: './load-button.component.css'
})
export class LoadButtonComponent {
  colorClass = input('btn-primary');
  formInvalid = input(false);
  loading = input(false);
}
