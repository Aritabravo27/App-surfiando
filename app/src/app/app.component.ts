import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PopupOutletComponent } from './shared/popup-outlet.component';
import { SeoService } from './core/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PopupOutletComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
   private seo = inject(SeoService);
  constructor() { this.seo.init(); }
  title = 'app';
}
