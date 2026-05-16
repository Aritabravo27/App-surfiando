import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  imports: [NgClass],
  standalone: true,
  template: `
    <div class="spinner" [class.overlay]="overlay" [ngClass]="speed" role="status" aria-live="polite">
      <img [src]="src" [alt]="alt" [style.width.px]="size" [style.height.px]="size" />
      <span class="sr-only">{{ label }}</span>
    </div>
  `,
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  @Input() src = 'assets/tu-logo.png';
  @Input() size = 64;
  @Input() speed: 'slow' | 'normal' | 'fast' = 'normal';
  @Input() overlay = false;         // true = pantalla completa
  @Input() alt = 'Cargando';
  @Input() label = 'Cargando…';
}