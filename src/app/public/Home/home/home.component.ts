import { Component } from '@angular/core';
import { PopupService } from '../../../shared/popup.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private popup: PopupService) {}

  openPopup(tipo: 'acerca' | 'eventos' | 'musica' | 'galeria' | 'cancionero') {
    this.popup.open(tipo);
  }
}
