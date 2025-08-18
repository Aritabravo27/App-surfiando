import { CommonModule, NgFor } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { NgbDate, NgbDatepickerModule, NgbDatepickerNavigateEvent, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

type UiEvent = {
  id: string;
  title: string;
  start: Date;    
  url: string};

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, NgbDatepickerModule, NgFor],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent {
  get startDateStruct(): NgbDateStruct {
    const d = this._viewDate();  
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: 1 };
  }
  private _viewDate = signal<Date>(new Date());
  selectedDate = signal<Date | null>(null);

  readonly events = signal<UiEvent[]>([
    { id: 'e1', title: 'Otra historia', start: new Date(2025, 10, 2, 20, 0), url:'' },
    { id: 'e2', title: 'Otra historia', start: new Date(2025, 10, 12, 20, 0), url:'' },
    { id: 'e3', title: 'Otra historia', start: new Date(2025, 10, 12, 22, 0), url:'' },
  ]);


  get initialModel(): NgbDateStruct {
    const d = this._viewDate();
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }


  readonly visibleEvents = computed(() => {
    const list = this.events();
    const sel = this.selectedDate();
    const vd = this._viewDate();

    if (sel) {
      const yyyy = sel.getFullYear(), mm = sel.getMonth(), dd = sel.getDate();
      return list
        .filter(e =>
          e.start.getFullYear() === yyyy &&
          e.start.getMonth() === mm &&
          e.start.getDate() === dd
        )
        .sort((a, b) => +a.start - +b.start);
    }
    return list
      .sort((a, b) => +a.start - +b.start);
  });

  get hasFilter() { return this.selectedDate() !== null; }

  onSelectDay(d: any) {
    if (!d || d.year == null || d.month == null) return;
    const date = new Date(d.year, d.month - 1, d.day ?? 1);
    const has = this.events().some(e =>
      e.start.getFullYear() === date.getFullYear() &&
      e.start.getMonth() === date.getMonth() &&
      e.start.getDate() === date.getDate()
    );
    if (!has) return;
    const sel = this.selectedDate();
    const same = !!sel &&
      sel.getFullYear() === date.getFullYear() &&
      sel.getMonth() === date.getMonth() &&
      sel.getDate() === date.getDate();
    this.selectedDate.set(same ? null : date);
  }

  onNavigate(ev: any) {
    const { year, month } = ev?.next ?? {};
    if (year == null || month == null) return;
    const d = new Date(year, month - 1, 1);
    this._viewDate.set(d);
    const sel = this.selectedDate();
    if (sel && (sel.getFullYear() !== d.getFullYear() || sel.getMonth() !== d.getMonth())) {
      this.selectedDate.set(null);
    }
  }


  clearFilter() { this.selectedDate.set(null); }

  fmtDate(d: Date) { return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`; }
  fmtTime(d: Date) { return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }

  hasEventOn(struct: NgbDateStruct): boolean {
    return this.events().some(e =>
      e.start.getFullYear() === struct.year &&
      e.start.getMonth() === struct.month - 1 &&
      e.start.getDate() === struct.day
    );
  }

  isSelected(struct: NgbDateStruct): boolean {
    const sel = this.selectedDate();
    return !!sel &&
      sel.getFullYear() === struct.year &&
      sel.getMonth() === struct.month - 1 &&
      sel.getDate() === struct.day;
  }
}
