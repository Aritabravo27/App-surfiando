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
  @Input() src =
    'https://surfiando.netlify.app/media/92133101_255878032121471_8944472217498982430_n-BVKTUFH7.jpg';
  @Input() size = 64;
  @Input() speed: 'slow' | 'normal' | 'fast' = 'normal';
  @Input() overlay = false;         // true = pantalla completa
  @Input() alt = 'Cargando';
  @Input() label = 'Cargando…';
}