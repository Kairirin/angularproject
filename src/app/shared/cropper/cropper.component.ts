import { Component, input, output } from '@angular/core';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'cropper',
  imports: [ImageCropperComponent],
  templateUrl: './cropper.component.html',
  styleUrl: './cropper.component.css'
})
export class CropperComponent {
  image = input<Event | null>(null);
  ratio = input<number>(1);
  width = input<number>(200);
  ready = output<string>();
  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl  = '';
    
    constructor(private sanitizer: DomSanitizer) {
    }

    fileChangeEvent(event: Event): void {
        this.imageChangedEvent = event;
    }
    
    imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64!;
      this.ready.emit(this.croppedImage as string);
    }
}
