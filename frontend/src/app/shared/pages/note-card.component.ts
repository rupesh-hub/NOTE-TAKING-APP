import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Note } from '../../features/models/project.model';
import { TruncatePipe } from '../pipes/truncate.pipe';

@Component({
  selector: 'nta-note-card',
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  template: `
    <div class="card">
      <p class="date">{{ note.createdAt | date:'medium' }}</p>
      <h3 class="title">{{ note.title }}</h3>
      <p class="description">{{ note.content | truncate:100 }}</p>
      <div class="tags">
        <span class="tag tag-primary"></span>
        <span class="tag tag-secondary"></span>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        height: 170px;
        max-width: 400px;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 16px;
        transition: box-shadow 0.3s;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .card:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }

      .date {
        font-size: 0.75rem;
        color: rgb(104, 104, 104);
        margin: 0;
        font-weight: 500;
      }

      .title {
        font-size: .90rem;
        font-weight: 600;
        color: rgb(104, 104, 104);
        margin: 0;
      }

      .description {
        font-size: 0.80rem;
        line-height: 20px;
        color: rgb(200, 200, 200);
        margin: 0;
      }

      .tags {
        display: flex;
        gap: 8px;
        margin-top: auto;
      }

      .tag {
        font-size: 0.75rem;
        padding: 4px 8px;
        border-radius: 8px;
        font-weight: 500;
      }

      .tag-primary {
        background-color: #fef3c7;
        color: #d97706;
      }

      .tag-secondary {
        background-color: #e0e7ff;
        color: #4338ca;
      }
    `,
  ],
})
export class NoteCardComponent {
  @Input() note: Note;


}
