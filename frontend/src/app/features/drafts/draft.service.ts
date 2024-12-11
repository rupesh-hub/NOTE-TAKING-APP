import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  private url: string = `${environment.API_URL}/drafts`;
  private http: HttpClient = inject(HttpClient);

  public create(request: any): Observable<any | HttpErrorResponse> {
    return this.http.post(`${this.url}`, request);
  }

  public getByProjectId(
    projectId: string
  ): Observable<any | HttpErrorResponse> {
    return this.http.get(`${this.url}/project/${projectId}`);
  }

  public getById(id: string): Observable<any | HttpErrorResponse> {
    return this.http.get(`${this.url}/${id}`);
  }

  public update(id: string, request: any): Observable<any | HttpErrorResponse> {
    return this.http.put(`${this.url}/${id}`, request);
  }

  public delete(id: string): Observable<any | HttpErrorResponse> {
    return this.http.delete(`${this.url}/${id}`);
  }

  public addImages(
    id: string,
    images: any
  ): Observable<any | HttpErrorResponse> {
    return this.http.put(`${this.url}/${id}/images`, images);
  }

  public deleteImages(
    id: string,
    imageId: string
  ): Observable<any | HttpErrorResponse> {
    return this.http.delete(`${this.url}/${id}/images/${imageId}`);
  }
}
