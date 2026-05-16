import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import type { SiteMerchItemConfig } from '../../models/site-config';
import { ConfigService } from '../../services/config.service';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-merch-popup',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, SpinnerComponent],
  templateUrl: './merch-popup.component.html',
  styleUrl: './merch-popup.component.scss',
})
export class MerchPopupComponent implements OnInit {
  loading = true;
  items: SiteMerchItemConfig[] = [];

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {
    this.configService
      .getConfig()
      .pipe(take(1))
      .subscribe({
        next: (c) => {
          this.items = c.merch ?? [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }
}
