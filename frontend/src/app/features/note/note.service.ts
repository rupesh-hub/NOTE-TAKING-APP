import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NoteService {

  private BASE_URL = `${environment.API_URL}/notes`;

  private _httpClient: HttpClient = inject(HttpClient);

  /**
   * Create a new note.
   * @param noteData - Data of the note to be created.
   * @returns Observable of the created note or error.
   */
  createNote(noteData: FormData, projectId:string): Observable<any> {
    return this._httpClient.post(`${this.BASE_URL}?projectId=${projectId}`, noteData).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error) => {
        console.error('Error creating note:', error);
        return of(null);
      })
    );
  }

  /**
   * Delete a specific note.
   * @param noteId - ID of the note to delete.
   * @returns Observable of the delete operation result.
   */
  deleteNote(noteId: string, projectId: string): Observable<any> {
    return this._httpClient.delete(`${this.BASE_URL}/${noteId}?projectId=${projectId}`).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error) => {
        console.error('Error deleting note:', error);
        return of(null); // Handle error and return fallback
      })
    );
  }

  /**
   * Get a note's details by ID.
   * @param noteId - ID of the note to retrieve.
   * @returns Observable of the note details.
   */
  getNoteDetails(noteId: string, projectId: string): Observable<any> {
    return this._httpClient
      .get(`${this.BASE_URL}/${noteId}?projectId=${projectId}`)
      .pipe(
        map((response: any) => response),
        catchError((error) => {
          console.error('Error fetching note details:', error);
          return of(null);
        })
      );
  }

  /**
   * Get all notes for a user with advanced filtering and pagination
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @param filters Optional filters for notes
   * @returns Observable of notes with pagination metadata
   */
  getAllNotes(
    page: number = 1,
    limit: number = 10,
    filters: {
      status?: string;
      title?: string;
      project?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Observable<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalNotes: number;
    };
  }> {
    // Construct query parameters
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Add optional filters
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.title) {
      params = params.set('title', filters.title);
    }

    if (filters.project) {
      params = params.set('project', filters.project);
    }

    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }

    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }

    // Make HTTP GET request with parameters
    return this._httpClient
      .get<{
        data: any[];
        pagination: {
          page: number;
          limit: number;
          totalPages: number;
          totalNotes: number;
        };
      }>(`${this.BASE_URL}`, { params })
      .pipe(
        catchError((error) => {
          console.error('Error fetching all notes:', error);
          return throwError(
            () => new Error('Failed to fetch notes. Please try again later.')
          );
        })
      );
  }
  /**
   * Update a note by ID.
   * @param noteId - ID of the note to update.
   * @param noteData - Updated data of the note.
   * @returns Observable of the updated note.
   */
  updateNote(noteId: string, noteData: FormData, projectId:string): Observable<any> {
    return this._httpClient.put(`${this.BASE_URL}/${noteId}?projectId=${projectId}`, noteData).pipe(
      map((response: any) => response),
      catchError((error) => {
        console.error('Error updating note:', error);
        return of(null);
      })
    );
  }

  /**
   * Archive a note by ID.
   * @param noteId - ID of the note to archive.
   * @returns Observable of the archive operation result.
   */
  archiveNote(noteId: string): Observable<any> {
    return this._httpClient.put(`${this.BASE_URL}/archive/${noteId}`, {}).pipe(
      map((response: any) => response),
      catchError((error) => {
        console.error('Error archiving note:', error);
        return of(null);
      })
    );
  }

  /**
   * Unarchive a note by ID.
   * @param noteId - ID of the note to unarchive.
   * @returns Observable of the unarchive operation result.
   */
  unarchiveNote(noteId: string): Observable<any> {
    return this._httpClient
      .put(`${this.BASE_URL}/unarchive/${noteId}`, {})
      .pipe(
        map((response: any) => response),
        catchError((error) => {
          console.error('Error unarchiving note:', error);
          return of(null);
        })
      );
  }

}
