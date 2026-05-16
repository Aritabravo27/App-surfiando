import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import type { SiteTeamMemberConfig } from '../../models/site-config';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-about-popup',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './about-popup.component.html',
  styleUrl: './about-popup.component.scss',
})
export class AboutPopupComponent implements OnInit {
  team: SiteTeamMemberConfig[] = [];
  bio = '';

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {
    this.configService
      .getConfig()
      .pipe(take(1))
      .subscribe((c) => {
        this.team = c.about?.team ?? [];
        this.bio = c.about?.bio ?? '';
      });
  }
}
