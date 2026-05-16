import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { take } from 'rxjs';
import { ConfigService } from '../../services/config.service';

export type UiEvent = {
  id: string;
  title: string;
  start: Date;
  url: string;
  location: string;
};

function parseEventDate(raw: string): Date {
  const s = String(raw || '').trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    return new Date(y, mo - 1, d, 12, 0, 0, 0);
  }
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t);
  return new Date();
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  private readonly _events = signal<UiEvent[]>([]);

  readonly visibleEvents = computed(() =>
    this._events().slice().sort((a, b) => +a.start - +b.start)
  );

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {
    this.configService
      .getConfig()
      .pipe(take(1))
      .subscribe((c) => {
        const evs = c.events ?? [];
        this._events.set(
          evs.map((row, i) => ({
            id: `${i}-${row.name}`,
            title: row.name,
            start: parseEventDate(row.date),
            url: row.ctaUrl,
            location: row.location,
          }))
        );
      });
  }

  fmtDate(d: Date): string {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear())}`;
  }

  fmtTime(d: Date): string {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}
