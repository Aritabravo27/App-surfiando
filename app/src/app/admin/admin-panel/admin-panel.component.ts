import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type {
  GalleryImageConfig,
  GalleryUploadFolder,
  SiteConfig,
  SiteEventConfig,
  SiteMerchItemConfig,
  SiteMusicAlbumConfig,
  SiteMusicVideoConfig,
  SiteTeamMemberConfig,
  VideoItemConfig,
} from '../../models/site-config';
import { ConfigService } from '../../services/config.service';

export type AdminTab = 'contact' | 'music' | 'events' | 'merch' | 'about';

type AlbumEditRow = {
  title: string;
  coverUrl: string;
  videos: { youtubeId: string; title: string }[];
};

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss',
  host: { class: 'admin-app' },
})
export class AdminPanelComponent implements OnInit {
  config: SiteConfig | null = null;
  adminTab: AdminTab = 'music';
  clipsText = '';
  vivosText = '';
  imagesText = '';
  tapasText = '';
  fotosEnVivoText = '';
  cambalacheText = '';
  socialInstagram = '';
  socialYoutube = '';
  socialSpotify = '';
  socialBandcamp = '';
  socialEmail = '';
  socialPhone = '';
  eventRows: SiteEventConfig[] = [];
  merchRows: SiteMerchItemConfig[] = [];
  teamRows: SiteTeamMemberConfig[] = [];
  albumRows: AlbumEditRow[] = [];
  aboutBio = '';
  loading = false;
  saving = false;
  message = '';
  error = '';
  uploadBusy = false;
  uploadBusyFolder: GalleryUploadFolder | null = null;
  uploadRowTarget: { kind: 'merch' | 'team' | 'album-cover'; index: number } | null = null;
  uploadMsg = '';
  uploadErr = '';
  dragOverFolder: GalleryUploadFolder | null = null;
  lastUploadedPreview: string[] = [];
  lastUploadedFolderLabel = '';

  constructor(
    private readonly configService: ConfigService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.uploadMsg = '';
    this.uploadErr = '';
    this.lastUploadedPreview = [];
    this.lastUploadedFolderLabel = '';
    this.configService.getConfig().subscribe({
      next: (c) => {
        this.config = c;
        this.applyConfigToForm(c);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'No se pudo cargar la configuración';
      },
    });
  }

  save(): void {
    if (!this.config) return;
    this.message = '';
    this.error = '';

    const eventError = this.validateEventRowsBeforeSave();
    if (eventError) {
      this.error = eventError;
      return;
    }

    const teamError = this.validateTeamRowsBeforeSave();
    if (teamError) {
      this.error = teamError;
      return;
    }

    this.saving = true;
    const clips = this.linesToVideos(this.clipsText);
    const vivos = this.linesToVideos(this.vivosText);
    const images = this.linesToGalleryImages(this.imagesText);
    const tapas = this.linesToGalleryImages(this.tapasText);
    const fotosEnVivo = this.linesToGalleryImages(this.fotosEnVivoText);
    const cambalache = this.linesToGalleryImages(this.cambalacheText);
    const events = this.buildEventsFromRows();
    const merch = this.merchRows
      .filter((m) => m.name.trim() && m.photoUrl.trim() && m.linkUrl.trim())
      .map((m, i) => ({
        name: m.name.trim(),
        photoUrl: m.photoUrl.trim(),
        linkUrl: m.linkUrl.trim(),
        order: i,
      }));
    const team = this.buildTeamFromRows();
    const musicAlbums: SiteMusicAlbumConfig[] = this.albumRows
      .filter(
        (row) =>
          row.title.trim() &&
          row.coverUrl.trim() &&
          this.isHttpUrl(row.coverUrl.trim())
      )
      .map((row, i) => {
        const videos: SiteMusicVideoConfig[] = row.videos
          .map((v) => {
            const id = this.extractYoutubeId(v.youtubeId);
            if (!id) return null;
            return {
              youtubeId: id,
              title: v.title.trim() || undefined,
            } as SiteMusicVideoConfig;
          })
          .filter((v): v is SiteMusicVideoConfig => v !== null)
          .map((v, vi) => ({ ...v, order: vi }));
        return {
          title: row.title.trim(),
          coverUrl: row.coverUrl.trim(),
          videos,
          order: i,
        };
      });
    const aboutPayload: SiteConfig['about'] = { team };
    const bioTrim = this.aboutBio.trim();
    if (bioTrim) aboutPayload.bio = bioTrim.slice(0, 8000);
    const body: SiteConfig = {
      ...this.config,
      videos: { clips, vivos },
      gallery: { images, tapas, fotosEnVivo, cambalache },
      social: {
        instagram: this.socialInstagram.trim() || undefined,
        youtube: this.socialYoutube.trim() || undefined,
        spotify: this.socialSpotify.trim() || undefined,
        bandcamp: this.socialBandcamp.trim() || undefined,
        email: this.socialEmail.trim() || undefined,
        phone: this.socialPhone.trim() || undefined,
      },
      events,
      merch,
      music: { albums: musicAlbums },
      about: aboutPayload,
    };
    this.configService.saveConfig(body).subscribe({
      next: (saved) => {
        this.config = saved;
        this.applyConfigToForm(saved);
        this.saving = false;
        this.message = 'Guardado correctamente.';
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.error || err?.message || 'Error al guardar';
      },
    });
  }

  logout(): void {
    this.configService.logout();
    void this.router.navigate(['/admin/login']);
  }

  addEventRow(): void {
    this.eventRows.push({ name: '', date: '', time: '', location: '', ctaUrl: '' });
  }

  removeEventRow(i: number): void {
    this.eventRows.splice(i, 1);
  }

  addMerchRow(): void {
    this.merchRows.push({ name: '', photoUrl: '', linkUrl: '' });
  }

  removeMerchRow(i: number): void {
    this.merchRows.splice(i, 1);
  }

  addTeamRow(): void {
    this.teamRows.push({ name: '', role: '', bio: '', photoUrl: '', linkUrl: '' });
  }

  removeTeamRow(i: number): void {
    this.teamRows.splice(i, 1);
  }

  addAlbumRow(): void {
    this.albumRows.push({ title: '', coverUrl: '', videos: [] });
  }

  removeAlbumRow(i: number): void {
    this.albumRows.splice(i, 1);
  }

  addAlbumVideoRow(albumIndex: number): void {
    const row = this.albumRows[albumIndex];
    if (row) row.videos.push({ youtubeId: '', title: '' });
  }

  removeAlbumVideoRow(albumIndex: number, videoIndex: number): void {
    const row = this.albumRows[albumIndex];
    if (row) row.videos.splice(videoIndex, 1);
  }

  onAlbumCoverFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files?.length) {
      this.uploadPhotoForIndexedRow(Array.from(files), 'album-cover', index);
    }
    input.value = '';
  }

  folderLabel(folder: GalleryUploadFolder): string {
    switch (folder) {
      case 'tapas':
        return 'Tapas';
      case 'fotos-en-vivo':
        return 'Fotos en vivo';
      case 'cambalache':
        return 'Cambalache';
    }
  }

  onDragOver(event: DragEvent, folder: GalleryUploadFolder): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFolder = folder;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFolder = null;
  }

  onDrop(event: DragEvent, folder: GalleryUploadFolder): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFolder = null;
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.uploadFilesForAlbum(Array.from(files), folder);
    }
  }

  onFileAlbumChange(event: Event, folder: GalleryUploadFolder): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files?.length) {
      this.uploadFilesForAlbum(Array.from(files), folder);
    }
    input.value = '';
  }

  onMerchFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files?.length) {
      this.uploadPhotoForIndexedRow(Array.from(files), 'merch', index);
    }
    input.value = '';
  }

  onTeamFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files?.length) {
      this.uploadPhotoForIndexedRow(Array.from(files), 'team', index);
    }
    input.value = '';
  }

  uploadFilesForAlbum(files: File[], folder: GalleryUploadFolder): void {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    if (imgs.length === 0) {
      this.uploadErr =
        'No se encontraron fotos. Elegí archivos JPG, PNG, WebP o GIF desde tu galería o carpeta de fotos.';
      this.uploadMsg = '';
      return;
    }
    this.uploadBusy = true;
    this.uploadBusyFolder = folder;
    this.uploadRowTarget = null;
    this.uploadErr = '';
    this.uploadMsg = '';
    this.configService.uploadGalleryPhotos(imgs, folder).subscribe({
      next: (res) => {
        this.appendUrlsForFolder(res.urls, folder);
        this.lastUploadedPreview = res.urls;
        this.lastUploadedFolderLabel = this.folderLabel(folder);
        this.uploadBusy = false;
        this.uploadBusyFolder = null;
        this.uploadMsg = `Listo: ${res.count} foto(s) en «${this.lastUploadedFolderLabel}». Para publicar, tocá «Guardar todo en el sitio».`;
      },
      error: (err) => {
        this.uploadBusy = false;
        this.uploadBusyFolder = null;
        this.uploadErr =
          err?.error?.error ||
          'No se pudieron subir las fotos. Revisá tu internet o probá archivos más chicos (máx. 5 MB cada una).';
      },
    });
  }

  uploadPhotoForIndexedRow(
    files: File[],
    kind: 'merch' | 'team' | 'album-cover',
    index: number
  ): void {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    if (imgs.length === 0) {
      this.uploadErr =
        'No se encontraron fotos. Elegí archivos JPG, PNG, WebP o GIF desde tu galería o carpeta de fotos.';
      this.uploadMsg = '';
      return;
    }
    this.uploadBusy = true;
    this.uploadBusyFolder = null;
    this.uploadRowTarget = { kind, index };
    this.uploadErr = '';
    this.uploadMsg = '';
    const slice = imgs.slice(0, 1);
    const upload$ =
      kind === 'merch'
        ? this.configService.uploadMerchPhotos(slice)
        : kind === 'team'
          ? this.configService.uploadTeamPhotos(slice)
          : this.configService.uploadGalleryPhotos(slice, 'tapas');
    upload$.subscribe({
      next: (res) => {
        const url = res.urls[0];
        if (url) {
          if (kind === 'merch' && this.merchRows[index]) {
            this.merchRows[index].photoUrl = url;
          }
          if (kind === 'team' && this.teamRows[index]) {
            this.teamRows[index].photoUrl = url;
          }
          if (kind === 'album-cover' && this.albumRows[index]) {
            this.albumRows[index].coverUrl = url;
          }
        }
        this.lastUploadedPreview = res.urls;
        this.lastUploadedFolderLabel =
          kind === 'album-cover' ? 'Tapa de álbum' : kind === 'merch' ? 'Merch' : 'Equipo';
        this.uploadBusy = false;
        this.uploadRowTarget = null;
        this.uploadMsg = `Foto subida («${this.lastUploadedFolderLabel}»). Recordá guardar.`;
      },
      error: (err) => {
        this.uploadBusy = false;
        this.uploadRowTarget = null;
        this.uploadErr =
          err?.error?.error ||
          'No se pudieron subir las fotos. Revisá tu internet o probá archivos más chicos (máx. 5 MB cada una).';
      },
    });
  }

  isDropActive(folder: GalleryUploadFolder): boolean {
    return this.dragOverFolder === folder;
  }

  isUploading(folder: GalleryUploadFolder): boolean {
    return this.uploadBusy && this.uploadBusyFolder === folder;
  }

  isRowPhotoUploading(kind: 'merch' | 'team' | 'album-cover', index: number): boolean {
    return (
      this.uploadBusy &&
      this.uploadRowTarget?.kind === kind &&
      this.uploadRowTarget?.index === index
    );
  }

  private appendUrlsForFolder(urls: string[], folder: GalleryUploadFolder): void {
    let current: string;
    switch (folder) {
      case 'tapas':
        current = this.tapasText;
        break;
      case 'fotos-en-vivo':
        current = this.fotosEnVivoText;
        break;
      case 'cambalache':
        current = this.cambalacheText;
        break;
      default:
        return;
    }
    const lines = current.trim()
      ? current.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];
    for (const u of urls) lines.push(u);
    const joined = lines.join('\n');
    switch (folder) {
      case 'tapas':
        this.tapasText = joined;
        break;
      case 'fotos-en-vivo':
        this.fotosEnVivoText = joined;
        break;
      case 'cambalache':
        this.cambalacheText = joined;
        break;
    }
  }

  private linesToVideos(text: string): VideoItemConfig[] {
    return text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((url) => ({ url }));
  }

  private linesToGalleryImages(text: string): GalleryImageConfig[] {
    return text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((url) => ({ url }));
  }

  private extractYoutubeId(raw: string): string | null {
    const s = String(raw ?? '').trim();
    if (!s) return null;
    const mWatch = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (mWatch) return mWatch[1];
    const mShort = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (mShort) return mShort[1];
    const mEmbed = s.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (mEmbed) return mEmbed[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
    return null;
  }

  private applyConfigToForm(c: SiteConfig): void {
    this.clipsText = c.videos.clips.map((x) => x.url).join('\n');
    this.vivosText = c.videos.vivos.map((x) => x.url).join('\n');
    this.imagesText = (c.gallery.images ?? []).map((x) => x.url).join('\n');
    this.tapasText = (c.gallery.tapas ?? []).map((x) => x.url).join('\n');
    this.fotosEnVivoText = (c.gallery.fotosEnVivo ?? []).map((x) => x.url).join('\n');
    this.cambalacheText = (c.gallery.cambalache ?? []).map((x) => x.url).join('\n');
    this.socialInstagram = c.social?.instagram ?? '';
    this.socialYoutube = c.social?.youtube ?? '';
    this.socialSpotify = c.social?.spotify ?? '';
    this.socialBandcamp = c.social?.bandcamp ?? '';
    this.socialEmail = (c.social?.email ?? '').replace(/^mailto:/i, '');
    this.socialPhone = c.social?.phone ?? '';
    this.eventRows = (c.events ?? []).map((e) => this.eventConfigToRow(e));
    this.merchRows = (c.merch ?? []).map((m) => ({
      name: m.name,
      photoUrl: m.photoUrl,
      linkUrl: m.linkUrl,
    }));
    this.teamRows = (c.about?.team ?? []).map((t) => ({
      name: t.name,
      role: t.role,
      bio: t.bio ?? '',
      photoUrl: t.photoUrl,
      linkUrl: t.linkUrl,
    }));
    this.aboutBio = c.about?.bio ?? '';
    this.albumRows = (c.music?.albums ?? []).map((a: SiteMusicAlbumConfig) => ({
      title: a.title,
      coverUrl: a.coverUrl,
      videos: (a.videos ?? []).map((v: SiteMusicVideoConfig) => ({
        youtubeId: v.youtubeId,
        title: v.title ?? '',
      })),
    }));
  }

  private eventConfigToRow(e: SiteEventConfig): SiteEventConfig {
    const dateRaw = e.date ?? '';
    let date =
      dateRaw.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(dateRaw)
        ? dateRaw.slice(0, 10)
        : dateRaw;
    let time = e.time?.trim() ?? '';
    if (!time) {
      const isoTime = /T(\d{1,2}):(\d{2})/.exec(dateRaw.trim());
      if (isoTime) {
        time = `${isoTime[1].padStart(2, '0')}:${isoTime[2]}`;
      }
    }
    return {
      name: e.name,
      date,
      time,
      location: e.location,
      ctaUrl: e.ctaUrl,
    };
  }

  private normalizeEventTimeForSave(raw: string | undefined): string | undefined {
    const s = String(raw ?? '').trim();
    const m = /^(\d{1,2}):(\d{2})$/.exec(s);
    if (!m) return undefined;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h < 0 || h > 23 || min < 0 || min > 59) return undefined;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  private isEventRowEmpty(e: SiteEventConfig): boolean {
    return (
      !e.name.trim() &&
      !e.date.trim() &&
      !(e.time?.trim() ?? '') &&
      !e.location.trim() &&
      !e.ctaUrl.trim()
    );
  }

  private isEventRowComplete(e: SiteEventConfig): boolean {
    const ctaUrl = this.normalizeHttpUrl(e.ctaUrl);
    return !!(
      e.name.trim() &&
      e.date.trim() &&
      e.location.trim() &&
      ctaUrl &&
      this.isHttpUrl(ctaUrl)
    );
  }

  private validateEventRowsBeforeSave(): string | null {
    const invalid: string[] = [];
    this.eventRows.forEach((e, i) => {
      if (this.isEventRowEmpty(e)) return;
      if (!this.isEventRowComplete(e)) {
        invalid.push(e.name.trim() || `Evento ${i + 1}`);
      }
    });
    if (invalid.length === 0) return null;
    return (
      `Hay eventos incompletos (${invalid.join(', ')}): cada uno necesita nombre, fecha, lugar ` +
      'y enlace con https:// (ej. https://entrada.com).'
    );
  }

  private buildEventsFromRows(): SiteEventConfig[] {
    const out: SiteEventConfig[] = [];
    for (const e of this.eventRows) {
      if (this.isEventRowEmpty(e)) continue;
      const ctaUrl = this.normalizeHttpUrl(e.ctaUrl);
      if (
        !e.name.trim() ||
        !e.date.trim() ||
        !e.location.trim() ||
        !ctaUrl ||
        !this.isHttpUrl(ctaUrl)
      ) {
        continue;
      }
      const row: SiteEventConfig = {
        name: e.name.trim(),
        date: e.date.trim(),
        location: e.location.trim(),
        ctaUrl,
        order: out.length,
      };
      const time = this.normalizeEventTimeForSave(e.time);
      if (time) row.time = time;
      out.push(row);
    }
    return out;
  }

  private isTeamRowEmpty(t: SiteTeamMemberConfig): boolean {
    return (
      !t.name.trim() &&
      !t.role.trim() &&
      !(t.bio?.trim() ?? '') &&
      !t.photoUrl.trim() &&
      !t.linkUrl.trim()
    );
  }

  private isTeamRowComplete(t: SiteTeamMemberConfig): boolean {
    const photoUrl = this.normalizeHttpUrl(t.photoUrl);
    const linkUrl = this.normalizeHttpUrl(t.linkUrl);
    return !!(
      t.name.trim() &&
      t.role.trim() &&
      photoUrl &&
      linkUrl &&
      this.isHttpUrl(photoUrl) &&
      this.isHttpUrl(linkUrl)
    );
  }

  private validateTeamRowsBeforeSave(): string | null {
    const invalid: string[] = [];
    this.teamRows.forEach((t, i) => {
      if (this.isTeamRowEmpty(t)) return;
      if (!this.isTeamRowComplete(t)) {
        invalid.push(t.name.trim() || `Persona ${i + 1}`);
      }
    });
    if (invalid.length === 0) return null;
    return (
      `Hay miembros del equipo incompletos (${invalid.join(', ')}): cada uno necesita nombre, rol, ` +
      'foto y enlace con https:// (ej. https://instagram.com/tu-cuenta).'
    );
  }

  private buildTeamFromRows(): SiteTeamMemberConfig[] {
    const out: SiteTeamMemberConfig[] = [];
    for (const t of this.teamRows) {
      if (this.isTeamRowEmpty(t)) continue;
      const photoUrl = this.normalizeHttpUrl(t.photoUrl);
      const linkUrl = this.normalizeHttpUrl(t.linkUrl);
      if (
        !t.name.trim() ||
        !t.role.trim() ||
        !photoUrl ||
        !linkUrl ||
        !this.isHttpUrl(photoUrl) ||
        !this.isHttpUrl(linkUrl)
      ) {
        continue;
      }
      out.push({
        name: t.name.trim(),
        role: t.role.trim(),
        bio: t.bio?.trim() || undefined,
        photoUrl,
        linkUrl,
        order: out.length,
      });
    }
    return out;
  }

  private normalizeHttpUrl(raw: string): string {
    const s = raw.trim();
    if (!s) return '';
    if (this.isHttpUrl(s)) return s;
    const withHttps = `https://${s.replace(/^\/+/, '')}`;
    if (this.isHttpUrl(withHttps)) return withHttps;
    return s;
  }

  private isHttpUrl(s: string): boolean {
    try {
      const u = new URL(s);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
