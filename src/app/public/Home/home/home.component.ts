import { NgIf, NgSwitch,NgSwitchCase } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { GalleryComponent } from '../../gallery/gallery.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgSwitch,NgIf,GalleryComponent,NgSwitchCase],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  activePopup: string | null = null;

  openPopup(tipo: string) {
    this.activePopup = tipo;
  }

  closePopup() {
    this.activePopup = null;
  }
}
