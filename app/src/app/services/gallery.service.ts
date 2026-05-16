import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { resolveApiBaseUrl } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  constructor(private http: HttpClient) {}

  public getImageUrls(): Observable<any> {
    return this.http.get(`${resolveApiBaseUrl()}/gallery/get`);
  }

  public getGalleryImageList(): Observable<{ id?: string; url: string }[]> {
    return this.getImageUrls().pipe(
      map((res: { results?: { url: string }[] }) =>
        Array.isArray(res?.results) ? res.results : []
      )
    );
  }
}
