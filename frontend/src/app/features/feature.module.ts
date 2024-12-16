import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { 
        path: '', 
        component: HomeComponent
      },
      {
        path: 'projects',
        loadChildren: () => import('./project/project.module').then(m => m.ProjectModule)
      },
      {
        path: 'notes',
        loadChildren: () => import('./note/note.module').then(m => m.NoteModule)
      },
      {
        path: 'collaborators',
        loadChildren: () => import('./collaborator/collaborator.module').then(m => m.CollaboratorModule)
      },
      {
        path:'users',
        loadChildren: () => import('./user/user.module').then(m => m.UserModule)
      }
     
    ]
  }
];

@NgModule({
  declarations:[HomeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports:[RouterModule]
})
export class FeatureModule { }