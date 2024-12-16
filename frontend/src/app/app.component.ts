import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from './core/services/authentication.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  protected user: any;
  isExpanded: boolean = true;

  toggleNavigation() {
    this.isExpanded = !this.isExpanded;
  }

  constructor(
    protected _authenticationService: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
    this._authenticationService.authenticatedUser$.subscribe({
      next: (user: any) => {
        if (!user.name || !user.email || !user.profile) {
          user = {
            name: localStorage.getItem('name'),
            email: localStorage.getItem('email'),
            profile: localStorage.getItem('profile'),
          };
        }
        this.user = user;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

}
