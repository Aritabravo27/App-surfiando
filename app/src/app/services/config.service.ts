import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment, resolveApiBaseUrl } from '../../environments/environment';
import type { GalleryUploadFolder, SiteConfig } from '../models/site-config';

const TOKEN_KEY = 'adminJwt';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  private get base(): string {
    if (environment.apiUrl?.trim()) {
      return environment.apiUrl.replace(/\/$/, '');
    }
    if (isPlatformBrowser(this.platformId)) {
      return `${globalThis.location.origin}/api`;
    }
    return resolveApiBaseUrl();
  }

  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? globalThis.localStorage : null;
  }

  getConfig(): Observable<SiteConfig> {
    const params: Record<string, string> = {};
    if (isPlatformBrowser(this.platformId)) {
      params['_'] = String(Date.now());
    }
    return this.http.get<SiteConfig>(`${this.base}/config`, { params });
  }

  login(password: string): Observable<{ token: string; expiresIn: string }> {
    return this.http
      .post<{ token: string; expiresIn: string }>(`${this.base}/auth/login`, {
        password,
      })
      .pipe(tap((res) => this.storage?.setItem(TOKEN_KEY, res.token)));
  }

  logout(): void {
    this.storage?.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return this.storage?.getItem(TOKEN_KEY) ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  saveConfig(body: SiteConfig): Observable<SiteConfig> {
    const token = this.getToken();
    return this.http.put<SiteConfig>(`${this.base}/config`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  uploadGalleryPhotos(
    files: File[],
    folder: GalleryUploadFolder
  ): Observable<{ urls: string[]; count: number; folder: string }> {
    const token = this.getToken();
    const fd = new FormData();
    fd.append('folder', folder);
    for (const f of files) {
      fd.append('photos', f, f.name);
    }
    return this.http.post<{ urls: string[]; count: number; folder: string }>(
      `${this.base}/upload/gallery`,
      fd,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  uploadMerchPhotos(
    files: File[]
  ): Observable<{ urls: string[]; count: number; folder: string }> {
    const token = this.getToken();
    const fd = new FormData();
    for (const f of files) {
      fd.append('photos', f, f.name);
    }
    return this.http.post<{ urls: string[]; count: number; folder: string }>(
      `${this.base}/upload/merch`,
      fd,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  uploadTeamPhotos(
    files: File[]
  ): Observable<{ urls: string[]; count: number; folder: string }> {
    const token = this.getToken();
    const fd = new FormData();
    for (const f of files) {
      fd.append('photos', f, f.name);
    }
    return this.http.post<{ urls: string[]; count: number; folder: string }>(
      `${this.base}/upload/team`,
      fd,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}
