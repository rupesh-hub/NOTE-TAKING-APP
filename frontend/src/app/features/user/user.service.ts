import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserService {
 
  private _httpClient: HttpClient = inject(HttpClient);
  private BASE_URL: string = `${environment.API_URL}/users`

  constructor() {}

  public changePasswordRequest = (): Observable<any | HttpErrorResponse> => {
    return this._httpClient.get<any | HttpErrorResponse>(
      `${this.BASE_URL}/change-password-request`
    );
  };

  public searchUserByEmail = (email: string): Observable<any | HttpErrorResponse> => {
    return this._httpClient.get<any | HttpErrorResponse>(`${this.BASE_URL}/${email}`);
  };

  public changePassword = (
    oldPassword: string,
    newPassword: string,
    confirmPassword: any,
    token: any
  ): Observable<any | HttpErrorResponse> => {
    return this._httpClient.put<any | HttpErrorResponse>(
      `${this.BASE_URL}/change-password`,
      { oldPassword, newPassword, confirmPassword, token }
    );
  };

  public profile = () => {
    return this._httpClient.get<any>(`${this.BASE_URL}/profile`);
  }

 public uploadProfilePicture = (formData: FormData): Observable<any | HttpErrorResponse> => {
    return this._httpClient.put(`${this.BASE_URL}/change-profile-picture`, formData);
  }
  public updateProfile = (editedProfile: any): Observable<any | HttpErrorResponse> => {
    return this._httpClient.put(`${this.BASE_URL}/update-profile`, editedProfile);
  }
  
}
