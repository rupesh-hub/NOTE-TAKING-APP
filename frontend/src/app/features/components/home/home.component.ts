import { Component, OnInit, inject } from '@angular/core';
import { ProjectCardComponent } from '../../../shared/pages/project-card.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  faStar,
  faFolder,
  faCircleCheck,
  faClock,
  faStickyNote,
} from '@fortawesome/free-regular-svg-icons';
import { NoteCardComponent } from '../../../shared/pages/note-card.component';
import { ProjectService } from '../../services/project.service';
import { Note, Project } from '../../models/project.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'nta-home',
  standalone: true,
  imports: [
    ProjectCardComponent,
    CommonModule,
    FontAwesomeModule,
    NoteCardComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {

  protected faStar = faStar;
  protected faFolder = faFolder;
  protected faCircleCheck = faCircleCheck;
  protected faClock = faClock;
  protected faStickyNote = faStickyNote;

  protected projects: Project[];
  protected notes: Note[];

  private projectService: ProjectService = inject(ProjectService);

  protected recentActivities: any = [
    {
      profile:
        'https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://fdczvxmwwjwpwbeeqcth.supabase.co/storage/v1/object/public/images/14334755-dbc4-456e-aec8-043257e724ed/bdbe3802-c024-40be-bf75-fd800547d677.png',
      name: 'Alice Johnson',
      activity: 'commented on your post',
      date: '2 hours ago',
    },
    {
      profile:
        'https://i.pinimg.com/564x/5a/7b/c9/5a7bc9ee8614eef19ae0caf54f24af30.jpg',
      name: 'Bob Smith',
      activity: 'liked your photo',
      date: 'Yesterday',
    },
    {
      profile:
        'https://media.istockphoto.com/id/1369508766/photo/beautiful-successful-latin-woman-smiling.jpg?s=612x612&w=0&k=20&c=LoznG6eGT42_rs9G1dOLumOTlAveLpuOi_U755l_fqI=',
      name: 'Charlie Brown',
      activity: 'started following you',
      date: '3 days ago',
    },
    {
      profile:
        'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?cs=srgb&dl=pexels-olly-733872.jpg&fm=jpg',
      name: 'Daisy Miller',
      activity: 'shared your post',
      date: 'Last week',
    },
    {
      profile:
        'https://cdn.create.vista.com/api/media/small/165554118/stock-photo-woman-in-hat-and-coat',
      name: 'Edward Wilson',
      activity: 'mentioned you in a comment',
      date: '2 weeks ago',
    },
  ];

  public ngOnInit(): void {
    this.viewAllProjects();
    this.viewAllNotes();
  }

  private viewAllProjects(): void {
    this.projectService.viewAllProjects().subscribe({
      next: (next: Project[]) => {
        this.projects = next;
        console.log(this.projects);
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
      complete: () => {
        console.log('completed.');
      },
    });
  }

  private viewAllNotes(): void {
    this.projectService.viewAllNotes().subscribe({
      next: (next: Note[]) => {
        this.notes = next;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
      complete: () => {
        console.log('completed.');
      },
    });
  }
}
