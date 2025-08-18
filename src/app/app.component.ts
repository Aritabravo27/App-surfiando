import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PopupOutletComponent } from './shared/popup-outlet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PopupOutletComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'app';
}
