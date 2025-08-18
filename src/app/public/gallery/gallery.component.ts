import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../../services/gallery.service';
import { PopupService } from './../../shared/popup.service';
import { YoutubeEmbedPipe } from '../../core/helpers/youtube-embed.pipe';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [NgStyle, NgFor, NgIf, YoutubeEmbedPipe, SpinnerComponent],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})

export class GalleryComponent {
  constructor(private galleryService: GalleryService, private popup: PopupService) { }
    isLoading = false;
  images: { url: string; style: { 'grid-column': string; 'grid-row': string } }[] = [];
  urls = [];
  activePopup: string | null = null;
  activeTab: 'images' | 'videos' = 'images';
  activeVideoTab: 'clips' | 'vivos' = 'clips';
  clips: string[] = ['https://www.youtube.com/watch?v=TLYK98R8bTQ&ab_channel=proyectoSURFIANDO', 'https://www.youtube.com/watch?v=TLYK98R8bTQ&ab_channel=proyectoSURFIANDO', 'https://www.youtube.com/watch?v=TLYK98R8bTQ&ab_channel=proyectoSURFIANDO', 'https://www.youtube.com/watch?v=TLYK98R8bTQ&ab_channel=proyectoSURFIANDO'];
  vivos: string[] = ['https://www.youtube.com/watch?v=b8X-qyRcjVE&ab_channel=Pint%C3%B3%21Audiovisuales'];

  ngOnInit() {
    this.isLoading = true;
    this.images = this.urls.map((url: string) => {
      const rowSpan = Math.random() > 0.7 ? 2 : 1;
      const colSpan = Math.random() > 0.7 ? 2 : 1;
      return {
        url,
        style: {
          'grid-column': `span ${colSpan}`,
          'grid-row': `span ${rowSpan}`
        }
      };
    });
    this.galleryService.getImageUrls().subscribe({
      next: (res: any) => {
        const urls = res.map((x: { url: any; }) => x.url);
        this.urls = urls;

        this.images = urls.map((url: string) => {
          const rowSpan = Math.random() > 0.7 ? 2 : 1;
          const colSpan = Math.random() > 0.7 ? 2 : 1;
          return {
            
            url,
            style: {
              'grid-column': `span ${colSpan}`,
              'grid-row': `span ${rowSpan}`
            }
          };
        });
         this.isLoading = false;
      },
      error: (err: any) => { /* toast/error */ }
    });

  }

  setTab(tab: 'images' | 'videos') {
    this.activeTab = tab;
  }
  setVideoTab(tab: 'clips' | 'vivos') {
    this.activeVideoTab = tab;
  }
}
