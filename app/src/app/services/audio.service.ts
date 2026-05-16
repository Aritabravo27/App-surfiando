import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { resolveApiBaseUrl } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  constructor(private http: HttpClient) {}

  public uploadAudioUrls(urls: { name: string; url: string }[]): Observable<any> {
    return this.http.post(`${resolveApiBaseUrl()}/audio/post`, { urls });
  }

  public getAudioUrls(): Observable<any> {
    return this.http.get(`${resolveApiBaseUrl()}/audio/get`);
  }
}
