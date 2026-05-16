import { isPlatformBrowser, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { YoutubeEmbedPipe } from '../../core/helpers/youtube-embed.pipe';
import { ConfigService } from '../../services/config.service';
import { GalleryService } from '../../services/gallery.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

export type PhotoAlbumId = 'tapas' | 'fotosEnVivo' | 'cambalache';

const SWIPE_THRESHOLD_PX = 40;

const DEFAULT_CLIPS: string[] = [
  'https://www.youtube.com/watch?v=TLYK98R8bTQ&ab_channel=proyectoSURFIANDO',
  'https://www.youtube.com/watch?v=TLYK98R8bTQ&ab_channel=proyectoSURFIANDO',
  'https://www.youtube.com/watch?v=TLYK98R8bTQ&ab_channel=proyectoSURFIANDO',
  'https://www.youtube.com/watch?v=TLYK98R8bTQ&ab_channel=proyectoSURFIANDO',
];

const DEFAULT_VIVOS: string[] = [
  'https://www.youtube.com/watch?v=b8X-qyRcjVE&ab_channel=Pint%C3%B3%21Audiovisuales',
  'https://www.youtube.com/watch?v=aY-5yzq7SLw',
  'https://www.youtube.com/watch?v=P4-ZKv8TYhM',
  'https://www.youtube.com/watch?v=FC8U9ULEjls',
];

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [NgStyle, NgFor, NgIf, YoutubeEmbedPipe, SpinnerComponent],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit, OnDestroy {
  @ViewChild('lightboxDialog') private lightboxDialog?: ElementRef<HTMLElement>;
  @ViewChild('lightboxStage') private lightboxStage?: ElementRef<HTMLElement>;

  constructor(
    private readonly galleryService: GalleryService,
    private readonly configService: ConfigService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  readonly photoAlbumTabs: { id: PhotoAlbumId; label: string }[] = [
    { id: 'tapas', label: 'Tapas' },
    { id: 'fotosEnVivo', label: 'Fotos en vivo' },
    { id: 'cambalache', label: 'Cambalache' },
  ];

  isLoading = false;
  images: { url: string; style: { 'grid-column': string; 'grid-row': string } }[] = [];
  urls: string[] = [];
  /** Carrusel lightbox */
  isModalOpen = false;
  modalIndex = 0;
  activeTab: 'images' | 'videos' = 'images';
  activeVideoTab: 'clips' | 'vivos' = 'clips';
  activePhotoAlbum: PhotoAlbumId = 'tapas';
  /** Si hay fotos en las tres carpetas del config, mostramos sub-pestañas */
  useAlbumTabs = false;
  private albumUrlsMap: Record<PhotoAlbumId, string[]> = {
    tapas: [],
    fotosEnVivo: [],
    cambalache: [],
  };

  clips: string[] = [];
  vivos: string[] = [];

  private swipeStartX = 0;
  private swipePointerId: number | null = null;
  private swipeCaptured = false;
  private scrollLocked = false;

  get activeModalUrl(): string {
    if (!this.urls.length || this.modalIndex < 0 || this.modalIndex >= this.urls.length) {
      return '';
    }
    return this.urls[this.modalIndex];
  }

  get modalPositionLabel(): string {
    if (!this.urls.length) return '';
    return `${this.modalIndex + 1} / ${this.urls.length}`;
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
  }

  ngOnInit(): void {
    this.isLoading = true;
    forkJoin({
      config: this.configService.getConfig().pipe(catchError(() => of(null))),
      gallery: this.galleryService.getGalleryImageList().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ config, gallery }) => {
        const tapasUrls =
          config?.gallery?.tapas?.map((i) => i.url).filter(Boolean) ?? [];
        const vivoUrls =
          config?.gallery?.fotosEnVivo?.map((i) => i.url).filter(Boolean) ?? [];
        const cambUrls =
          config?.gallery?.cambalache?.map((i) => i.url).filter(Boolean) ?? [];
        const legacyUrls =
          config?.gallery?.images?.map((i) => i.url).filter(Boolean) ?? [];
        const fromApi = gallery.map((x) => x.url).filter(Boolean);

        const albumTotal = tapasUrls.length + vivoUrls.length + cambUrls.length;
        this.useAlbumTabs = albumTotal > 0;

        if (this.useAlbumTabs) {
          this.albumUrlsMap = {
            tapas: tapasUrls as string[],
            fotosEnVivo: vivoUrls as string[],
            cambalache: cambUrls as string[],
          };
          this.activePhotoAlbum = this.firstNonEmptyAlbum();
          this.setImagesFromUrls(this.albumUrlsMap[this.activePhotoAlbum]);
        } else {
          const urls = legacyUrls.length > 0 ? legacyUrls : fromApi;
          this.setImagesFromUrls(urls as string[]);
        }

        const clipUrls = (config?.videos?.clips ?? [])
          .map((v) => (typeof v === 'string' ? v : v.url))
          .filter(Boolean) as string[];
        const vivoVideoUrls = (config?.videos?.vivos ?? [])
          .map((v) => (typeof v === 'string' ? v : v.url))
          .filter(Boolean) as string[];

        this.clips = clipUrls.length > 0 ? clipUrls : [...DEFAULT_CLIPS];
        this.vivos = vivoVideoUrls.length > 0 ? vivoVideoUrls : [...DEFAULT_VIVOS];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.isModalOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  private firstNonEmptyAlbum(): PhotoAlbumId {
    if (this.albumUrlsMap.tapas.length) return 'tapas';
    if (this.albumUrlsMap.fotosEnVivo.length) return 'fotosEnVivo';
    return 'cambalache';
  }

  setPhotoAlbum(id: PhotoAlbumId): void {
    this.closeModal();
    this.activePhotoAlbum = id;
    if (this.useAlbumTabs) {
      this.setImagesFromUrls(this.albumUrlsMap[id]);
    }
  }

  private setImagesFromUrls(urls: string[]): void {
    this.urls = urls;
    this.images = urls.map((url: string) => {
      const rowSpan = Math.random() > 0.7 ? 2 : 1;
      const colSpan = Math.random() > 0.7 ? 2 : 1;
      return {
        url,
        style: {
          'grid-column': `span ${colSpan}`,
          'grid-row': `span ${rowSpan}`,
        },
      };
    });
    if (this.isModalOpen) {
      if (!urls.length) {
        this.closeModal();
      } else if (this.modalIndex >= urls.length) {
        this.modalIndex = urls.length - 1;
        this.prefetchNeighbors();
      }
    }
  }

  setTab(tab: 'images' | 'videos'): void {
    if (tab === 'videos') this.closeModal();
    this.activeTab = tab;
  }

  setVideoTab(tab: 'clips' | 'vivos'): void {
    this.activeVideoTab = tab;
  }

  openModal(index: number): void {
    if (!this.urls.length) return;
    this.modalIndex = Math.max(0, Math.min(index, this.urls.length - 1));
    this.isModalOpen = true;
    this.lockBodyScroll();
    this.prefetchNeighbors();
    queueMicrotask(() => {
      this.lightboxDialog?.nativeElement?.focus();
    });
  }

  closeModal(): void {
    if (!this.isModalOpen) return;
    this.isModalOpen = false;
    this.swipePointerId = null;
    this.swipeCaptured = false;
    this.unlockBodyScroll();
  }

  next(): void {
    if (!this.urls.length) return;
    this.modalIndex = (this.modalIndex + 1) % this.urls.length;
    this.prefetchNeighbors();
  }

  prev(): void {
    if (!this.urls.length) return;
    this.modalIndex = (this.modalIndex - 1 + this.urls.length) % this.urls.length;
    this.prefetchNeighbors();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onStagePointerDown(event: PointerEvent): void {
    if (!this.isModalOpen) return;
    this.swipeStartX = event.clientX;
    this.swipePointerId = event.pointerId;
    this.swipeCaptured = false;
    const el = this.lightboxStage?.nativeElement;
    if (el) {
      try {
        el.setPointerCapture(event.pointerId);
        this.swipeCaptured = true;
      } catch {
        /* ignore */
      }
    }
  }

  onStagePointerUp(event: PointerEvent): void {
    if (!this.isModalOpen || event.pointerId !== this.swipePointerId) return;
    const dx = event.clientX - this.swipeStartX;
    if (this.swipeCaptured && this.lightboxStage?.nativeElement) {
      try {
        this.lightboxStage.nativeElement.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }
    this.swipePointerId = null;
    this.swipeCaptured = false;
    if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
      if (dx < 0) this.next();
      else this.prev();
    }
  }

  onStagePointerCancel(event: PointerEvent): void {
    this.onStagePointerUp(event);
  }

  onItemKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openModal(index);
    }
  }

  private prefetchNeighbors(): void {
    const n = this.urls.length;
    if (n === 0) return;
    const i = this.modalIndex;
    const preload = (u: string) => {
      if (!u) return;
      const img = new Image();
      img.src = u;
    };
    preload(this.urls[i]);
    preload(this.urls[(i + 1) % n]);
    preload(this.urls[(i - 1 + n) % n]);
  }

  private lockBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId) || this.scrollLocked) return;
    document.body.style.overflow = 'hidden';
    this.scrollLocked = true;
  }

  private unlockBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId) || !this.scrollLocked) return;
    document.body.style.overflow = '';
    this.scrollLocked = false;
  }
}
