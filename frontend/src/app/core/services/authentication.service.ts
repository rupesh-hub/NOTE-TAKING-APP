import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  shareReplay,
  pipe,
  tap,
} from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> =
    this.isAuthenticatedSubject.asObservable();

  public authenticatedUser$ = new BehaviorSubject<any>({});

  private router: Router = inject(Router);
  private httpClient: HttpClient = inject(HttpClient);
  private BASE_URL = `${environment.API_URL}/auth`;

  constructor() {
    this.checkAuthStatus();
  }

  public login(email: string, password: string): Observable<boolean> {
    return this.httpClient
      .post<any>(`${this.BASE_URL}/authenticate`, {
        email,
        password,
      })
      .pipe(
        tap({
          next: (response) => {
            if (response && response.access_token) {
              this.storeToLocalStorage(response);
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
    this.httpClient
      .post(`${this.BASE_URL}/logout`, {})
      .pipe(
        tap({
          next: (response: any) => {
            console.log('Logging out => ' + response);
            localStorage.clear();
            this.isAuthenticatedSubject.next(false);
            this.authenticatedUser$.next(null);
            this.router.navigate(['/auth/login']);
          },
          error: (err) => {
            console.error('Logout failed', err);
            this.isAuthenticatedSubject.next(false);
          },
        })
      )
      .subscribe();
  }

  checkAuthStatus(): void {
    const token = localStorage.getItem('access_token');
    this.isAuthenticatedSubject.next(!!token);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  private storeToLocalStorage = (response: any): void => {
    if (response.access_token)
      localStorage.setItem('access_token', response.access_token);
    if (response.user) {
      localStorage.setItem(
        'name',
        response.user.firstName + ' ' + response.user.lastName
      );
      localStorage.setItem('email', response.user.email);
      localStorage.setItem('profile', response.user.profile);
    }

    this.authenticatedUser$.next({
      name: localStorage.getItem('name'),
      email: localStorage.getItem('email'),
      profile: this.getProfile(localStorage.getItem('profile')),
    });
  };

  public forgetPasswordRequest = (email: string): Observable<any> => {
    return this.httpClient
      .post(`${environment.API_URL}/auth/forget-password`, { email })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((err) => {
          console.error('Forget password request failed', err);
          return of(null);
        })
      );
  };

  public validateOTP = (token: string): Observable<boolean> => {
    const email = localStorage.getItem('email');
    return this.httpClient
      .post(`${environment.API_URL}/auth/verify-email`, {email, token})
      .pipe(
        map((response) => {
          return !!response;
        }),
        catchError((err) => {
          console.error('OTP validation failed', err);
          return of(false);
        })
      );
  };

  public resetPassword = (
    password: string,
    confirmPassword: string,
    token: string
  ): Observable<boolean> => {
    return this.httpClient
      .post(`${environment.API_URL}/auth/reset-password`, {
        password,
        confirmPassword,
        token,
      })
      .pipe(
        map((response) => {
          // Typically, this would return true if password reset is successful
          return !!response;
        }),
        catchError((err) => {
          console.error('Password reset failed', err);
          return of(false);
        })
      );
  };

  public register = (formData: any): Observable<any> => {
    return this.httpClient.post(
      `${environment.API_URL}/auth/register`,
      formData
    );
  };

  private getProfile(profilePath: any): any {
    if (!profilePath || profilePath.trim() === '') {
      return 'https://e1.pngegg.com/pngimages/45/989/png-clipart-flader-82-default-icons-for-apple-app-mac-os-x-notes-yellow-and-white-note-art-thumbnail.png'; // Provide a default image path
    }
    return profilePath;
  }
}
