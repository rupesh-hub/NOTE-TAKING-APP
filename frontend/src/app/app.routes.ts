import { Routes } from '@angular/router';
import { HomeComponent } from './features/components/home/home.component';
import { NoteEditorComponent } from './features/components/note-editor/note-editor.component';
import { CreateProjectComponent } from './features/components/create-project/create-project.component';
import { AuthenticationComponent } from './core/components/authentication/authentication.component';
import { RegisterComponent } from './core/components/register/register.component';
import { TaskComponent } from './features/components/task/task.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'notes/:projectId',
    component: NoteEditorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'projects/create',
    component: CreateProjectComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks',
    component: TaskComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'authentication',
    component: AuthenticationComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
