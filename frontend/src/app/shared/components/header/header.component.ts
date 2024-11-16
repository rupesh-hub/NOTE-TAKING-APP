import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  faBell,
  faMessage
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'nta-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  
  protected faBell = faBell;
  protected faMessage = faMessage;


}
