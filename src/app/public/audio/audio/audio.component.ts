import { ChangeDetectionStrategy, Component } from '@angular/core';
import { YoutubeEmbedPipe } from '../../../core/helpers/youtube-embed.pipe';
import { NgFor, NgIf } from '@angular/common';
type Video = {
  id: string;          // YouTube ID (recomendado guardar solo el ID)
  title?: string;
};

type Album = {
  id: string;
  title: string;
  cover: string;       // URL de la imagen de portada
  videos: Video[];
};

@Component({
  selector: 'app-audio',
  standalone: true,
  imports: [YoutubeEmbedPipe, NgIf, NgFor],
  templateUrl: './audio.component.html',
  styleUrl: './audio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioComponent {
  albums: Album[] = [
    {
      id: 'album-1',
      title: 'Sur fiando Vol. 1',
      cover: 'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755100132232_a3996368223_2.jpg?alt=media&token=27c3c6ac-574e-4da5-923c-e5d6a32bec5d',
      videos: [
        { id: 'dBvvDt9MMiQ', title: '.proyecto SUR FIANDO ▪︎ SUR FIANDO Vol. 1 (2017) • Full Album' }
      ],
    },
    {
      id: 'album-2',
      title: 'Sur fiando Vol. 2',
      cover: 'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017639_a0040070521_2.jpg?alt=media&token=fb639cf8-c9e4-490d-bf37-dff814871c54',
      videos: [
        { id: 'rooBWeMbWms', title: 'SUR FIANDO ▪︎ SUR FIANDO Vol. 2 (2020) ▪︎ Full Album' }
      ],
    },
    {
      id: 'album-3',
      title: 'Sur fiando Vol. 3',
      cover: 'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017640_a0265142612_2.jpg?alt=media&token=9d2e2583-0bdd-4bcf-b7a8-0a86588c9861',
      videos: [
        { id: 'oi1zCbYY_zo', title: 'SUR FIANDO ▪︎ SUR FIANDO Vol. 3 (2020) ▪︎ Full Album' }
      ],
    },
    {
      id: 'album-4',
      title: 'Sur fiando Vol. 4',
      cover: 'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017642_a1213970788_2.jpg?alt=media&token=e306c9d0-80a2-443a-8437-da4e4c62fe4c',
      videos: [
        { id: '6xfeANk_it4', title: 'DESTINO - SUR FIANDO' },
        { id: 'AmAcgQgntiM', title: 'POR LA SOMBRA - SUR FIANDO' },
        { id: 'mVee62QM0PY', title: 'NO SÉ - SUR FIANDO' },
        { id: 'GVoC7enQA78', title: 'EL CAMINO - SUR FIANDO' },
        { id: 'Bdn0lKcphRA', title: 'EN LA RONDA - SUR FIANDO' },
        { id: '77zekHJxIO0', title: 'BECERROS - SUR FIANDO' },
        { id: 'YdbS6Pr9RYM', title: 'BESANDO UN CIGARRILLO - SUR FIANDO' },
        { id: 'g4Y9pulrfbI', title: 'SOY - SUR FIANDO' },
        { id: 'sctFBTt8GUw', title: 'NO, NO TE VAYAS CAMPEÓN - SUR FIANDO' },
        { id: 'O8gD49YoWSM', title: 'SUR OUTRO - SUR FIANDO' },
      ],
    },
    {
      id: 'album-5',
      title: 'Sur fiando Vol. 5',
      cover: 'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017641_a0611384148_2.jpg?alt=media&token=12849f8c-3099-4f8b-a077-0ed71b1e2642',
      videos: [
        { id: 'X9-l6Sj5zcE', title: 'LA LOCOMOCIÓN COLECTIVA intro - SUR FIANDO' },
        { id: 'wfVAcF9QXRM', title: 'FAMILIA DE DOS - SUR FIANDO' },
        { id: 'U7Qz9jMlh8c', title: 'PIEL Y CARNE - SUR FIANDO' },
        { id: 'Oox1GtLzaQE', title: 'TUA TUA TÉ - SUR FIANDO' },
        { id: 'RCUlY671XRs', title: 'ALGO EN VOS  - SUR FIANDO' },
        { id: 'VYBBsodeFTg', title: 'INTER IN HER HEART - SUR FIANDO' },
        { id: 'FIyImrBc7pw', title: 'VIDA MIA - SUR FIANDO' },
        { id: 'qrPe-OBVI-s', title: 'Y SIEMPRE... - SUR FIANDO' },
        { id: 'TbAcgcy-uRM', title: '¿DÓNDE ESTOY? - SUR FIANDO' },
        { id: 'ykcFturDPzk', title: 'DÍA DE PAZ - SUR FIANDO' },
        { id: 'Z8CZW3Auqg4', title: 'CONSUMIDORES  - SUR FIANDO' },
      ],
    },
    {
      id: 'album-6',
      title: 'Sur fiando Vol. 6',
      cover: 'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2F1755031017641_a0588547452_2.jpg?alt=media&token=a9cfa3b4-f812-4bf9-870d-7f96531df54c',
      videos: [
        { id: 'lNGBxe8g2ec', title: 'STAY LOW - SUR FIANDO' },
        { id: 'qQO0QFEE9cw', title: 'FULL DOPAMINA - SUR FIANDO' },
        { id: 'Gem9xMG7US4', title: 'SÉPTIMO B - SUR FIANDO' },
        { id: '1g6XI9KYNOg', title: 'QUE NO SÉ - SUR FIANDO' },
        { id: 'MmigwJKTUg0', title: 'EN UN FLAI  - SUR FIANDO' },
        { id: 'u8WsvvktcEg', title: 'INTERMEDIO FANTAFRÍA - SUR FIANDO' },
        { id: 'JUloH7dfr7U', title: 'DIOS - SUR FIANDO' },
        { id: 'la_gwtb_wRY', title: 'TAN - SUR FIANDO' },
        { id: 'xCPQc-6IjTw', title: 'AMOR  - SUR FIANDO' },
        { id: '97ZNwZyfqmU', title: 'EN MI VIDA - SUR FIANDO' },
        { id: 'sbEZyYQZKUo', title: 'ALMA  - SUR FIANDO' },
        { id: 'MLrdeKsEcAA', title: 'OUTRO RELOADED - SUR FIANDO' },
      ],
    },
    {
      id: 'album-7',
      title: 'Sur fiando Vol. 7',
      cover: 'https://firebasestorage.googleapis.com/v0/b/sufiando.firebasestorage.app/o/images%2Fa2423070353_2.jpg?alt=media&token=83bc266e-303d-4b3a-89fe-0dafabcf5619',
      videos: [
        { id: 'Bxn98TpbtbU', title: 'LIBRO NEGRO - SUR FIANDO' },
        { id: 'mHYMOPaTteQ', title: 'EXISTE LA MAGIA - SUR FIANDO' },
        { id: 'Nztf-6aGpKM', title: 'EL NOVECI - SUR FIANDO' },
        { id: '1rkzn4SYjD8', title: 'LISERGIA INFINITA - SUR FIANDO' },
        { id: 'brHu93XTw28', title: 'INTER B.I.T.L.  - SUR FIANDO' },
        { id: 'x3bu5djppnw', title: 'CONOCERTEME - SUR FIANDO' },
        { id: 'AHVYl1ZLTEM', title: 'SOL - SUR FIANDO' },
        { id: '8tFD-TX59dI', title: 'CITY POP - SUR FIANDO' },
        { id: 'xE4AgU-8sO4', title: 'H.A.M.A. - SUR FIANDO' },
        { id: 'kTVAYYmT9xk', title: 'AIA MOR - SUR FIANDO' },
        { id: 'it0A8AJKV0c', title: 'NOR TEANDO - SUR FIANDO' }
      ],
    },


  ];
  selectedAlbumId: string | null = null;
  playing = new Set<string>();

  // helpers UI
  get selectedAlbum(): Album | undefined {
    return this.albums.find(a => a.id === this.selectedAlbumId);
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
