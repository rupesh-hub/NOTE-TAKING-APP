import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { Project } from '../../features/models/project.model';
import { Router } from '@angular/router';

@Component({
  selector: 'nta-project-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div
      class="card"
      (click)="navigateToNote(project)"
      [ngStyle]="{ width: width ? width : '' }"
    >
      <div class="content-info">
        <div
          class="color-dot"
          [ngStyle]="{ 'background-color': 'purple' }"
        ></div>
        <h3 class="title">{{ project?.name }}</h3>
      </div>

      <div class="spacer"></div>
      <p style="font-size: 13px; color: gray;">{{ project?.description }}</p>
      <div class="spacer"></div>

      <div class="date-info">
        <p class="date">{{ project?.createdAt | date : 'medium' }}</p>
        <fa-icon [icon]="faEllipsisH"></fa-icon>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        // max-width: 400px;
        height: 150px;
        border-radius: 8px;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: box-shadow 0.3s;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 1rem;
        // background: #f4f4f4;

        &:hover {
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
      }

      .content-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .color-dot {
        height: 10px;
        width: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .title {
        font-weight: 500;
        color: #1a202c;
        margin: 0;
        font-size: 14px;
      }

      .date-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #1a202c;
        font-size: 0.875rem;
      }

      .date {
        margin: 0;
      }
    `,
  ],
})
export class ProjectCardComponent {
  @Input() project: Project;
  @Input() width: string;
  private router = inject(Router);
  faEllipsisH = faEllipsisH;

  protected navigateToNote(project: any): void {
    this.router.navigate([`/notes/${project._id}`]);
  }
}
