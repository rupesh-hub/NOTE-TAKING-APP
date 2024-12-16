import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project } from './model/project.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private BASE_URL = `${environment.API_URL}/projects`;
  private _httpClient: HttpClient = inject(HttpClient);
  private _router: Router = inject(Router);

  public create = (request: any):Observable<any> => {
    return this._httpClient
      .post(`${this.BASE_URL}/`, request)
      .pipe(
        tap({
          next: () => {},
          error: (error) => console.error('Error creating project', error),
        })
      );
  };

  public getAll = (): Observable<any> => {
    return this._httpClient.get<Project[]>(this.BASE_URL);
  };

  public getById = (id: string): Observable<Project> => {
    return this._httpClient.get<Project>(`${this.BASE_URL}/by.id?projectId=${id}`);
  };

  public update = (project: any): Observable<any | HttpErrorResponse> => {
    return this._httpClient.put(`${this.BASE_URL}?projectId=${project.id}`, project);
  };

  public delete = (id: string): Observable<any> => {
    return this._httpClient.delete<any>(`${this.BASE_URL}/delete?projectId=${id}`);
  };

  public filter = (query: string): Observable<Project[]> => {
    return this._httpClient.get<Project[]>(`${this.BASE_URL}/${query}`);
  };

  public addCollaborators = (collaborators: any, projectId:string): Observable<any> => {
    return this._httpClient.post<Project[]>(
      `${this.BASE_URL}/add-collaborators?projectId=${projectId}`,
      collaborators
    );
  };

  public removeCollaborators = (request: any, projectId:string): Observable<any> => {
    return this._httpClient.post<Project[]>(
      `${this.BASE_URL}/remove-collaborators?projectId=${projectId}`,
      request
    );
  };
}
