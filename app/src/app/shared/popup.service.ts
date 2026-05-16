import { Injectable, signal } from '@angular/core';

export type PopupType = 'acerca' | 'eventos' | 'musica' | 'galeria' | 'merch' | string;
export interface PopupState<T = unknown> {
  type: PopupType;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class PopupService {
  private _current = signal<PopupState | null>(null);
  readonly current = this._current.asReadonly();

  open<T>(type: PopupType, data?: T) {
    this._current.set({ type, data });
  }

  close() {
    this._current.set(null);
  }

  is(type: PopupType) {
    return this._current()?.type === type;
  }
}
