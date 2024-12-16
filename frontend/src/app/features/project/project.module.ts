import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { CreateProjectComponent } from './components/create-project/create-project.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastComponent } from '../../core/toast.component';

const routes: Routes = [
  {
    path: 'create',
    redirectTo: 'create/project',
    pathMatch: 'full'
  },
  {
    path: 'create/project',
    component: CreateProjectComponent
  },
  {
    path: ':projectId',
    component: ProjectDetailComponent
  }
];

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectDetailComponent,
    CreateProjectComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule
  ],
  exports: [RouterModule]
})
export class ProjectModule { }
