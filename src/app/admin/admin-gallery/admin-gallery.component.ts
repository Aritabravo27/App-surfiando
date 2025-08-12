import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FirebaseUploadService } from '../../core/firebase/fireUpload.service';
import { GalleryService } from '../../services/gallery.service';

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './admin-gallery.component.html',
  styleUrl: './admin-gallery.component.scss'
})
export class AdminGalleryComponent {
  constructor(private firebaseUpload: FirebaseUploadService, private galleryService: GalleryService) { }
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  btn = document.querySelector<HTMLButtonElement>('.btn-save');
  previewImages: string[] = [];
  selectedFiles: File[] = [];
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (var file of Array.from(input.files)) {
      this.previewImages.push(URL.createObjectURL(file));
      this.selectedFiles.push(file);
    }
    // this.previewImages.push(event);
    console.log(event)
  }
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!event.dataTransfer?.files) return;

    for (const file of Array.from(event.dataTransfer.files)) {
      if (file.type.startsWith('image/')) {
        this.previewImages.push(URL.createObjectURL(file));
      }
      this.selectedFiles.push(file);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  saveImages() {
    if (this.btn) this.btn.disabled = true;
    this.firebaseUpload.uploadMultiple(this.selectedFiles).then(res => {
      console.log(res)
      this.sendToBackend(res);
    });
  }
  sendToBackend(urls: string[]) {
    this.galleryService.uploadImageUrls(urls).subscribe({
      next: (res: any) => {
        this.previewImages = [];
        if (this.btn) this.btn.disabled = false;
      },
      error: (err: any) => {
        if (this.btn) this.btn.disabled = false;
      }
    });
  }
  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }
}
