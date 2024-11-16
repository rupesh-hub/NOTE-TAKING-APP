import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Authority, UserFilterResponse } from '../models/auth-model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> =
    this.isAuthenticatedSubject.asObservable();

  private filteredUsersSubject = new BehaviorSubject<
    UserFilterResponse[] | null
  >(null);
  filteredUsers$ = this.filteredUsersSubject.asObservable();

  private router: Router = inject(Router);
  private httpClient: HttpClient = inject(HttpClient);

  constructor() {
    this.checkAuthStatus();
  }

  public login(username: string, password: string): Observable<boolean> {
    return this.httpClient
      .post<any>(`${environment.API_URL}/users/authenticate`, {
        username,
        password,
      })
      .pipe(
        tap({
          next: (response) => {
            if (response && response.access_token) {
              localStorage.setItem('auth_token', response.access_token);
              localStorage.setItem(
                'name',
                response?.user?.firstName + ' ' + response?.user?.lastName
              );
              localStorage.setItem('username', response?.user?.username);
              localStorage.setItem('email', response?.user?.email);
              this.isAuthenticatedSubject.next(true);
              this.router.navigate(['/home']);
            } else {
              this.isAuthenticatedSubject.next(false);
            }
          },
          error: (err) => {
            console.error('Login failed', err);
            this.isAuthenticatedSubject.next(false);
          },
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/authentication']);
  }

  checkAuthStatus(): void {
    const token = localStorage.getItem('auth_token');
    this.isAuthenticatedSubject.next(!!token);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  filterUsers = (
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<UserFilterResponse[]> => {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.httpClient
      .get<UserFilterResponse[]>(`${environment.API_URL}/users/filter`, {
        params,
      })
      .pipe(
        tap({
          next: (response) => {
            this.filteredUsersSubject.next(response);
          },
          error: (err) => {
            console.error('User filtering failed', err);
            this.filteredUsersSubject.next(null);
          },
        })
      );
  };

  public getAuthorities(): Observable<Authority[]> {
    return this.httpClient.get<any>(`${environment.API_URL}/users/authorities`);
  }

  public authenticatedUser(): any {
    return {
      name: localStorage.getItem('name'),
      username: localStorage.getItem('username'),
      email: localStorage.getItem('email'),
      profile: 'https://cdn.pixabay.com/photo/2021/06/04/10/29/man-6309454_640.jpg'
    };
  }
}
