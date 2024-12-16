// project-dashboard.component.ts
import { Component, inject } from '@angular/core';
import { ProjectService } from '../project/project.service';
import { NoteService } from '../note/note.service';
import { finalize } from 'rxjs/operators';
import { ActivityService } from '../activity/activity.service';

interface Task {
  id: number;
  title: string;
  timeLeft: string;
  completed: boolean;
}

interface Note {
  _id: number;
  createdAt: string;
  title: string;
  content: string;
  tags: string[];
}

interface Activity {
  id: number;
  name: string; 
  date: string;
  profile: string;
  message: string;
}

@Component({
  selector: 'ccnta-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  projects: any[] = [];
  tasks: Task[] = [];
  notes: Note[] = [];
  activities: Activity[] = [];
  private _projectService: ProjectService = inject(ProjectService);
  private _noteService: NoteService = inject(NoteService);
  private _activityService: any = inject(ActivityService); 

  constructor() {
    this.loadProjects();
    this.loadTasks();
    this.loadNotes();
    this.loadActivities();
  }

  loadTasks() {
    this.tasks = [
      {
        id: 1,
        title: 'Work on plan',
        timeLeft: '3 hours left',
        completed: false,
      },
      {
        id: 2,
        title: 'Client meeting',
        timeLeft: '1 hour left',
        completed: false,
      },
      {
        id: 3,
        title: 'Design review',
        timeLeft: '5 hours left',
        completed: true,
      },
      {
        id: 4,
        title: 'Work on plan',
        timeLeft: '3 hours left',
        completed: false,
      },
      {
        id: 5,
        title: 'Client meeting',
        timeLeft: '1 hour left',
        completed: false,
      },
      {
        id: 6,
        title: 'Design review',
        timeLeft: '5 hours left',
        completed: true,
      },
      {
        id: 1,
        title: 'Work on plan',
        timeLeft: '3 hours left',
        completed: false,
      },
      {
        id: 2,
        title: 'Client meeting',
        timeLeft: '1 hour left',
        completed: false,
      },
      {
        id: 3,
        title: 'Design review',
        timeLeft: '5 hours left',
        completed: true,
      },
      {
        id: 1,
        title: 'Work on plan',
        timeLeft: '3 hours left',
        completed: false,
      },
      {
        id: 2,
        title: 'Client meeting',
        timeLeft: '1 hour left',
        completed: false,
      },
      {
        id: 3,
        title: 'Design review',
        timeLeft: '5 hours left',
        completed: true,
      },
    ];
  }

  loadActivities() {
   this._activityService.getActivities()
   .subscribe({
     next: (response: any) => {
       this.activities = response.logs.map((log: any) => ({
         name: log.creator,
         message: log.message,
         date: log.createdAt,
         profile: log.profile,
       }));
     },
     error: (error: any) => console.error('Error retrieving activities:', error),
   })
  }

  toggleTaskCompletion(task: Task) {
    task.completed = !task.completed;
  }

  protected loadProjects(): void {
    this._projectService.getAll().subscribe({
      next: (response: any) => {
        this.projects = response.projects;
      },
      error: (error: any) => console.error('Error retrieving projects:', error),
    });
  }

  // Centralized method for loading notes with comprehensive error handling
  private loadNotes(): void {
    // Reset loading state and prepare query parameters
    const queryParams: any = {
      status: 'active',
      title: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    // Use pipe to handle loading state
    this._noteService.getAllNotes(
      1, 
      20, 
      queryParams
    ).pipe(
      finalize(() => {
       
      })
    ).subscribe({
      next: (response) => {
        // Transform notes to ensure consistent interface
        this.notes = response.data;
      },
      error: (error) => {
        // Consider adding a toast or error notification service
        console.error('Error loading notes:', error);
      }
    });
  }
}
