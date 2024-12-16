import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment.development';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = `${environment.API_URL}/comments`;
  private _comments = new BehaviorSubject<any[]>([]);

  constructor(private _httpClient: HttpClient) {}

  public addComment(comment: any): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}`, comment).pipe(
      tap((response: any) => {
      })
    );
  }

  public getComments(noteId:string): Observable<any> {
    return this._httpClient.get<any[]>(`${this.apiUrl}/NOTE/${noteId}`).pipe(
      map((response: any) => {
        const comments = response.comments;
        const sortedComments = comments.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        console.log("SORTED C",sortedComments);

        this._comments.next(sortedComments);
      }),
      catchError((error) => {
        console.error('Error fetching notifications', error);
        this._comments.next([]);
        return of([]);
      })
    );
  }

  public addWebsocketComment(comment: any): void {
    const currentComments = this._comments.value;
    // Check if notification already exists to prevent duplicates
    const isDuplicate = currentComments.some(
      (c) => c._id === comment._id
    );

    if (!isDuplicate) {
      this._comments.next([comment, ...currentComments]);
    }
  }

  get comments$() {
    return this._comments.asObservable();
  }
}
