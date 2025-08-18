import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'youtubeEmbed',
  standalone: true,
  pure: true
})
export class YoutubeEmbedPipe implements PipeTransform {
  constructor(private dom: DomSanitizer) {}

  transform(url: string, params: string = 'rel=0&modestbranding=1'): SafeResourceUrl {
    const id = this.extractId(url);
    // si no encontró un ID, devuelve un about:blank seguro
    const embed = id
      ? `https://www.youtube.com/embed/${id}?${params}`
      : 'about:blank';
    return this.dom.bypassSecurityTrustResourceUrl(embed);
  }

  private extractId(url: string): string | null {
    if (!url) return null;

    // formatos soportados:
    // https://www.youtube.com/watch?v=VIDEOID
    // https://youtu.be/VIDEOID
    // https://www.youtube.com/embed/VIDEOID
    // + preserva si ya viene query v=...
    const watchMatch = url.match(/[?&]v=([0-9A-Za-z_-]{11})/);
    if (watchMatch) return watchMatch[1];

    const shortMatch = url.match(/youtu\.be\/([0-9A-Za-z_-]{11})/);
    if (shortMatch) return shortMatch[1];

    const embedMatch = url.match(/youtube\.com\/embed\/([0-9A-Za-z_-]{11})/);
    if (embedMatch) return embedMatch[1];

    return null;
  }
}
