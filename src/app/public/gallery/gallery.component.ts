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
  urls = ['https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017642_a2005198049_2.jpg?alt=media&token=425911ed-7da2-4332-8bcd-7207778af0cc',
    'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017641_a0611384148_2.jpg?alt=media&token=12849f8c-3099-4f8b-a077-0ed71b1e2642',
    'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017642_a1213970788_2.jpg?alt=media&token=e306c9d0-80a2-443a-8437-da4e4c62fe4c',
  'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017640_a0265142612_2.jpg?alt=media&token=9d2e2583-0bdd-4bcf-b7a8-0a86588c9861',
  'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017641_a0908967776_2.jpg?alt=media&token=fda53b4a-c591-4c75-bd8a-65318dfe4031',
  'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017639_a0040070521_2.jpg?alt=media&token=fb639cf8-c9e4-490d-bf37-dff814871c54',
  'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017641_a0588547452_2.jpg?alt=media&token=a9cfa3b4-f812-4bf9-870d-7f96531df54c'
  ];
  ngOnInit() {
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
    // this.galleryService.getImageUrls().subscribe({
    //   next: (res: any) => {
    //     const urls = res.results.map((x: { url: any; }) => x.url); // según tu API
    //     this.urls = urls;

    //     this.images = urls.map((url: string) => {
    //       const rowSpan = Math.random() > 0.7 ? 2 : 1;
    //       const colSpan = Math.random() > 0.7 ? 2 : 1;
    //       return {
    //         url,
    //         style: {
    //           'grid-column': `span ${colSpan}`,
    //           'grid-row': `span ${rowSpan}`
    //         }
    //       };
    //     });
    //   },
    //   error: (err: any) => { /* toast/error */ }
    // });

  }
}
