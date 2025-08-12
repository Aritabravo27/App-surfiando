import { NgFor, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { GalleryService } from '../../services/gallery.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [NgStyle, NgFor],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})

export class GalleryComponent {
  constructor(private galleryService: GalleryService) { }
  images: { url: string; style: { 'grid-column': string; 'grid-row': string } }[] = [];
  urls = [];
  ngOnInit() {
    this.galleryService.getImageUrls().subscribe({
      next: (res: any) => {
        const urls = res.results.map((x: { url: any; }) => x.url); // según tu API
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
      },
      error: (err: any) => { /* toast/error */ }
    });

  }
}
