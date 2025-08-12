import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../env/env.local';


@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public uploadImageUrls(urls: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/gallery`, { urls });
  };
  public getImageUrls(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gallery/get`);
  };
}

