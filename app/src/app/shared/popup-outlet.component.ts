import { CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { PopupService } from './popup.service';
import { GalleryComponent } from '../public/gallery/gallery.component';
import { MerchPopupComponent } from './merch-popup/merch-popup.component';
import { AudioComponent } from '../public/audio/audio/audio.component';
import { EventsComponent } from '../public/events/events.component';
import { AboutPopupComponent } from './about-popup/about-popup.component';

@Component({
  selector: 'app-popup-outlet',
  standalone: true,
  imports: [
    CommonModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    GalleryComponent,
    MerchPopupComponent,
    AudioComponent,
    EventsComponent,
    AboutPopupComponent,
  ],
  template: `
    <ng-container *ngIf="popup.current() as state">
      <div class="popup-overlay" (click)="close()"></div>

      <div class="popup-content" (click)="$event.stopPropagation()">
        <button type="button" class="close-btn" (click)="close()">✕</button>

        <ng-container [ngSwitch]="state.type">
          <div *ngSwitchCase="'acerca'"><app-about-popup></app-about-popup></div>
          <div *ngSwitchCase="'eventos'"><app-events></app-events></div>
          <div *ngSwitchCase="'musica'"><app-audio></app-audio></div>
          <div *ngSwitchCase="'galeria'"><app-gallery></app-gallery></div>
          <div *ngSwitchCase="'merch'"><app-merch-popup></app-merch-popup></div>
          <div *ngSwitchDefault>Popup no soportado: {{ state.type }}</div>
        </ng-container>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .popup-overlay {
        position: fixed;
        inset: 0;
        background: linear-gradient(165deg, rgba(12, 8, 6, 0.82) 0%, rgba(20, 14, 10, 0.88) 100%);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 1000;
      }
      .popup-content {
        position: fixed;
        left: 50%;
        top: 10vh;
        transform: translateX(-50%);
        background: var(--dark-brown);
        color: var(--light-cream);
        z-index: 1001;
        width: min(900px, 92vw);
        max-height: 80vh;
        overflow: auto;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
      }
      .popup-content :is(h1, h2, h3) {
        text-shadow: -1px 0 0 #000, 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000;
      }
      .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: transparent;
        border: 0;
        color: var(--light-cream);
        font-size: 18px;
        cursor: pointer;
      }
      .close-btn:focus-visible {
        outline: 2px solid var(--mustard);
        outline-offset: 2px;
      }
    `,
  ],
})
export class PopupOutletComponent {
  popup = inject(PopupService);

  @HostListener('document:keydown.escape')
  onEsc() {
    this.close();
  }

  close() {
    this.popup.close();
  }
}
