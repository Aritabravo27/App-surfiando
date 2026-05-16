import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { YoutubeEmbedPipe } from '../../../core/helpers/youtube-embed.pipe';
import { NgFor, NgIf } from '@angular/common';
import { take } from 'rxjs';
import type { SiteConfig } from '../../../models/site-config';
import { ConfigService } from '../../../services/config.service';

type Video = {
  id: string;
  title?: string;
};

type Album = {
  id: string;
  title: string;
  cover: string;
  videos: Video[];
};

function mapConfigToAlbums(c: SiteConfig): Album[] {
  const list = c.music?.albums ?? [];
  return list.map((a, i) => ({
    id: `album-${i}`,
    title: a.title,
    cover: a.coverUrl,
    videos: (a.videos ?? []).map((v) => ({ id: v.youtubeId, title: v.title })),
  }));
}

@Component({
  selector: 'app-audio',
  standalone: true,
  imports: [YoutubeEmbedPipe, NgIf, NgFor],
  templateUrl: './audio.component.html',
  styleUrl: './audio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioComponent implements OnInit {
  private readonly configService = inject(ConfigService);
  private readonly cdr = inject(ChangeDetectorRef);

  albums: Album[] = [];
  selectedAlbumId: string | null = null;
  playing = new Set<string>();

  get selectedAlbum(): Album | undefined {
    return this.albums.find((a) => a.id === this.selectedAlbumId);
  }

  ngOnInit(): void {
    this.configService
      .getConfig()
      .pipe(take(1))
      .subscribe({
        next: (c) => {
          this.albums = mapConfigToAlbums(c);
          this.cdr.markForCheck();
        },
        error: () => {
          this.albums = [];
          this.cdr.markForCheck();
        },
      });
  }

  openAlbum(id: string) {
    this.selectedAlbumId = id;
    this.playing.clear();
  }

  closeAlbum() {
    this.selectedAlbumId = null;
    this.playing.clear();
  }

  playVideo(videoId: string) {
    this.playing.add(videoId);
  }

  watchUrl(videoId: string) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  thumbUrl(videoId: string) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  trackByAlbum = (_: number, a: Album) => a.id;
  trackByVideo = (_: number, v: Video) => v.id;
}
