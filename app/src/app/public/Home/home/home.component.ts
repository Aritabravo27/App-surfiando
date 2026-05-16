import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { catchError, filter, of, take } from 'rxjs';
import type { SiteConfig } from '../../../models/site-config';
import { ConfigService } from '../../../services/config.service';
import { PopupService } from '../../../shared/popup.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  social: NonNullable<SiteConfig['social']> = {
    instagram: 'https://www.instagram.com/sur.fiando/',
    youtube: 'https://www.youtube.com/@proyectosurfiando360',
    spotify:
      'https://open.spotify.com/intl-es/artist/4IqVG0aAdQQ5cMBO9uLpk0?si=ybTYqHRCQr2IiKDTBFlEGg',
    bandcamp: 'https://surfiando.bandcamp.com/',
    email: 'mailto:proyectosurfiando.2020@gmail.com',
  };

  constructor(
    private readonly popup: PopupService,
    private readonly configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.loadSiteConfig();
    if (!isPlatformBrowser(this.platformId)) return;
    fromEvent(document, 'visibilitychange')
      .pipe(
        filter(() => document.visibilityState === 'visible'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadSiteConfig());
  }

  private loadSiteConfig(): void {
    this.configService
      .getConfig()
      .pipe(catchError(() => of(null)), take(1))
      .subscribe((cfg: SiteConfig | null) => {
        if (!cfg) return;
        if (cfg.social) {
          this.social = { ...this.social, ...cfg.social };
        }
      });
  }

  get phoneHref(): string | null {
    const p = this.social.phone?.trim();
    if (!p) return null;
    const d = p.replace(/[^\d+]/g, '');
    if (!d) return null;
    return d.startsWith('+') ? `tel:${d}` : `tel:${d}`;
  }

  get emailDisplay(): string {
    const e = this.social.email ?? '';
    return e.replace(/^mailto:/i, '');
  }

  openPopup(tipo: 'acerca' | 'eventos' | 'musica' | 'galeria' | 'merch') {
    this.popup.open(tipo);
  }
}
