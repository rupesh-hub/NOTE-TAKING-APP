import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private BASE_URL: string = `${environment.API_URL}/logs`;
  private _httpClient: HttpClient = inject(HttpClient);

  constructor() {}

  public getActivities(): Observable<any> {
    return this._httpClient
      .get<{ success: boolean; logs: any[]; pagination: any }>(
        `${this.BASE_URL}/project-logs`
      )
      .pipe(
        map((response) => {
          return {
            success: response.success,
            logs: response.logs.map((log) => ({
              creator: `${log.userId.firstName} ${log.userId.lastName}`,
              profile: log.userId.profile,
              message: log.details.message || '',
              createdAt: log.createdAt,
            })),
            pagination: response.pagination,
          };
        })
      );
  }
}
