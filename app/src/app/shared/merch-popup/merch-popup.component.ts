import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import type { SiteMerchItemConfig } from '../../models/site-config';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-merch-popup',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './merch-popup.component.html',
  styleUrl: './merch-popup.component.scss',
})
export class MerchPopupComponent implements OnInit {
  items: SiteMerchItemConfig[] = [];

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {
    this.configService
      .getConfig()
      .pipe(take(1))
      .subscribe((c) => {
        this.items = c.merch ?? [];
      });
  }
}
