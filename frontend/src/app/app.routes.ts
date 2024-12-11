import { Routes } from '@angular/router';
import { HomeComponent } from './features/components/home/home.component';
import { NoteEditorComponent } from './features/components/note-editor/note-editor.component';
import { CreateProjectComponent } from './features/components/create-project/create-project.component';
import { AuthenticationComponent } from './core/components/authentication/authentication.component';
import { RegisterComponent } from './core/components/register/register.component';
import { TaskComponent } from './features/components/task/task.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ForgetPasswordComponent } from './core/components/forget-password/forget-password.component';
import { ChangePasswordRequestComponent } from './core/components/change-password-request/change-password-request.component';
import { OptValidaterComponent } from './core/components/opt-validater/opt-validater.component';
import { ForgetPasswordRequestComponent } from './core/components/forget-password-request/forget-password-request.component';
import { ProfileComponent } from './core/components/profile/profile.component';

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
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'forget-password',
    component: ForgetPasswordRequestComponent
  },
  {
    path: 'reset-password',
    component: ForgetPasswordComponent
  },
  {
    path: 'change-password',
    component: ChangePasswordRequestComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'valiate-token',
    component: OptValidaterComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
