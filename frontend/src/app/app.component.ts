import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faMessage, faBell } from "@fortawesome/free-solid-svg-icons";
import { Observable } from "rxjs";
import { AuthService } from "./core/services/auth.service";
import { SideNavComponent } from "./shared/components/side-nav/side-nav.component";

@Component({
  selector: 'nta-root',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SideNavComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  protected faMessage = faMessage;
  protected faBell = faBell;
  protected authService: AuthService = inject(AuthService);
  
  isAuthenticated$: Observable<boolean>;
  protected authenticatedUser:any;

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated();

    this. authenticatedUser= this.authService.authenticatedUser();
  }
}