import { CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, HostListener, effect, inject } from '@angular/core';
import { PopupService } from './popup.service';
import { GalleryComponent } from '../public/gallery/gallery.component';
import { CancioneroComponent } from '../public/cancionero/cancionero.component';
import { AudioComponent } from '../public/audio/audio/audio.component';
import { EventsComponent } from '../public/events/events.component';

@Component({
  selector: 'app-popup-outlet',
  standalone: true,
  imports: [CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault, GalleryComponent,
    CancioneroComponent, AudioComponent, EventsComponent
  ],
  template: `
    <ng-container *ngIf="popup.current() as state">
      <div class="popup-overlay" (click)="close()"></div>

      <div class="popup-content" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="close()">✕</button>

        <ng-container [ngSwitch]="state.type">
          <div *ngSwitchCase="'acerca'"><p>Contenido de Acerca de...</p></div>
          <div *ngSwitchCase="'eventos'"><app-events></app-events></div>
          <div *ngSwitchCase="'musica'"><app-audio></app-audio></div>

          <div *ngSwitchCase="'galeria'">
            <app-gallery></app-gallery>
          </div>
      

          <div *ngSwitchCase="'cancionero'"><app-cancionero></app-cancionero></div>

          <div *ngSwitchDefault>Popup no soportado: {{ state.type }}</div>
        </ng-container>
      </div>
    </ng-container>
  `,
  styles: [`
    .popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1000;}
    .popup-content{position:fixed;left:50%;top:10vh;transform:translateX(-50%);
      background:var(--dark-brown);color:var(--light-cream);z-index:1001;
      width:min(900px,92vw);max-height:80vh;overflow:auto;
      border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:20px;}
    .close-btn{position:absolute;top:8px;right:8px;background:transparent;border:0;color:var(--light-cream);font-size:18px;cursor:pointer}
  `]
})
export class PopupOutletComponent {
  popup = inject(PopupService);

  constructor() {
    // effect(() => { document.body.style.overflow = this.popup.current() ? 'hidden' : ''; });
  }

  @HostListener('document:keydown.escape') onEsc() { this.close(); }
  close() { this.popup.close(); }
}
