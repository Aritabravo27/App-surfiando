import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { take } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

export type UiEvent = {
  id: string;
  title: string;
  start: Date;
  hasTime: boolean;
  url: string;
  location: string;
};

function parseEventTime(raw: string | undefined): { h: number; min: number } | null {
  const s = String(raw ?? '').trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, min };
}

function parseEventDate(dateRaw: string, timeRaw?: string): { start: Date; hasTime: boolean } {
  const s = String(dateRaw || '').trim();
  const timeFromField = parseEventTime(timeRaw);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (timeFromField) {
      return {
        start: new Date(y, mo - 1, d, timeFromField.h, timeFromField.min, 0, 0),
        hasTime: true,
      };
    }
    return { start: new Date(y, mo - 1, d, 0, 0, 0, 0), hasTime: false };
  }
  const isoTime = /T(\d{1,2}):(\d{2})/.exec(s);
  const t = Date.parse(s);
  if (!Number.isNaN(t)) {
    const start = new Date(t);
    const hasTime = !!timeFromField || !!isoTime;
    return { start, hasTime };
  }
  return { start: new Date(), hasTime: false };
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, SpinnerComponent],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  loading = true;
  private readonly _events = signal<UiEvent[]>([]);

  readonly visibleEvents = computed(() =>
    this._events().slice().sort((a, b) => +a.start - +b.start)
  );

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {
    this.configService
      .getConfig()
      .pipe(take(1))
      .subscribe({
        next: (c) => {
          const evs = c.events ?? [];
          this._events.set(
            evs.map((row, i) => {
              const { start, hasTime } = parseEventDate(row.date, row.time);
              return {
                id: `${i}-${row.name}`,
                title: row.name,
                start,
                hasTime,
                url: row.ctaUrl,
                location: row.location,
              };
            })
          );
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  fmtDate(d: Date): string {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear())}`;
  }

  fmtTime(d: Date): string {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}
