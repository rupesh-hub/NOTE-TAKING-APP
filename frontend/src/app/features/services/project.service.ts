import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Note, Project } from '../models/project.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  
  private http: HttpClient = inject(HttpClient);

  //view all projects
  public viewAllProjects(): Observable<Project[] | HttpErrorResponse> {
    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
    // });
    return this.http.get<Project[]>(`${environment.API_URL}/projects`);
  }

  //view project by id
  public viewProjectById(
    projectId: any
  ): Observable<any | HttpErrorResponse> {
    return this.http.get<any>(
      `${environment.API_URL}/projects/${projectId}`
    );
  }

  //update project

  //delete project

  //create note
  public createNote(note: any):Observable<any> {
    return this.http.post<any>(`${environment.API_URL}/notes`, note);
  }

  //view all notes : by project id
  public viewAllNotesByProjectId(projectId: any): Observable<Note[] | HttpErrorResponse> {
    return this.http.get<Note[]>(
      `${environment.API_URL}/notes/project/${projectId}`
    );
  }

  //view all notes : owner or collaborator
  public viewAllNotes(): Observable<Note[] | HttpErrorResponse> {
    return this.http.get<Note[]>(
      `${environment.API_URL}/notes`
    );
  }

  //update note

  //delete note


  saveProject(name: string, description: string, collaborators: any) {

    const body = {
      name,
      description,
      collaborators
    };
  
    return this.http.post(`${environment.API_URL}/projects`, body);
  }
  

  deleteNote(id: string):Observable<any> {
    return this.http.delete(`${environment.API_URL}/notes/${id}`)
  }

  activeProjectId():any {
   return localStorage.getItem('active-project-id');
  }

}
