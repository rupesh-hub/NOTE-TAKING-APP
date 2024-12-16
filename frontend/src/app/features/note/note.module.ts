import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteListComponent } from './components/note-list/note-list.component';
import { NoteDetailComponent } from './components/note-detail/note-detail.component';
import { NoteEditorComponent } from './components/note-editor/note-editor.component';
import { NoteComponent } from './note.component';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CollaborativeNoteComponent } from './components/collaborative-note.component';
import { ReviewComponent } from './components/review/review.component';

const routes: Routes = [
  {
    path: '',
    component: NoteComponent,
    children: [
      { path: '', component: NoteListComponent },
      { path: 'list', redirectTo: '', pathMatch: 'full' },
      { path: ':noteId', component: NoteDetailComponent },
    ],
  },
  { path: 'edit/:projectId', component: NoteEditorComponent },
  { path: 'edits/:id', component: CollaborativeNoteComponent },
];

@NgModule({
  declarations: [
    NoteListComponent,
    NoteDetailComponent,
    NoteEditorComponent,
    NoteComponent,
    CollaborativeNoteComponent,
    ReviewComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
  ],
  exports: [RouterModule],
})
export class NoteModule {}
