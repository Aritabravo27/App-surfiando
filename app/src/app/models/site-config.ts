export interface GalleryImageConfig {
  url: string;
  caption?: string;
  order?: number;
}

export interface VideoItemConfig {
  url: string;
  title?: string;
  order?: number;
}

export interface SiteConfigGallery {
  images: GalleryImageConfig[];
  tapas: GalleryImageConfig[];
  fotosEnVivo: GalleryImageConfig[];
  cambalache: GalleryImageConfig[];
}

export interface SiteEventConfig {
  name: string;
  date: string;
  time?: string;
  location: string;
  ctaUrl: string;
  order?: number;
}

export interface SiteMerchItemConfig {
  name: string;
  photoUrl: string;
  linkUrl: string;
  order?: number;
}

export interface SiteTeamMemberConfig {
  name: string;
  role: string;
  bio?: string;
  photoUrl: string;
  linkUrl: string;
  order?: number;
}

export interface SiteMusicVideoConfig {
  youtubeId: string;
  title?: string;
  order?: number;
}

export interface SiteMusicAlbumConfig {
  title: string;
  coverUrl: string;
  videos: SiteMusicVideoConfig[];
  order?: number;
}

export interface SiteMusicConfig {
  albums: SiteMusicAlbumConfig[];
}

export interface SiteAboutConfig {
  bio?: string;
  team: SiteTeamMemberConfig[];
}

export interface SiteConfig {
  version: number;
  updatedAt?: string | null;
  home: Record<string, unknown>;
  gallery: SiteConfigGallery;
  videos: { clips: VideoItemConfig[]; vivos: VideoItemConfig[] };
  social: {
    instagram?: string;
    youtube?: string;
    spotify?: string;
    bandcamp?: string;
    email?: string;
    phone?: string;
  };
  events: SiteEventConfig[];
  merch: SiteMerchItemConfig[];
  music: SiteMusicConfig;
  about: SiteAboutConfig;
  flags: Record<string, unknown>;
}

export type GalleryUploadFolder = 'tapas' | 'fotos-en-vivo' | 'cambalache';
