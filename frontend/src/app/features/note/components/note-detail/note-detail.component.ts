import { Component, inject } from '@angular/core';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import {
  faTrashCan,
  faEdit,
  faUser,
  faCalendar,
  faClock,
  faFileAlt,
  faTimesCircle
} from '@fortawesome/free-regular-svg-icons';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteService } from '../../note.service';
import { ToastService } from '../../../../core/toast.service';

@Component({
  selector: 'ccnta-note-detail',
  templateUrl: './note-detail.component.html',
  styleUrl: './note-detail.component.scss',
})
export class NoteDetailComponent {
  protected faTrashCan = faTrashCan;
  protected faEdit = faEdit;
  protected faUser = faUser;
  protected faCalendar = faCalendar;
  protected faClock = faClock;
  protected faFileAlt = faFileAlt;
  protected faPaperclip = faPaperclip;
  protected project:any;
  protected note: any;
  protected faTimesCircle = faTimesCircle;

  private _noteService: NoteService = inject(NoteService);
  private _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _toastService:ToastService = inject(ToastService);
  private _router: Router = inject(Router);
  protected noteId: string;
  private projectId: string;
  protected showNoteRemoveModal = false;

  constructor(
  ) {
    // Get the project ID from the route parameters
    this._activatedRoute.params.subscribe((params) => {
      this.noteId = params['noteId'];
      this.projectId = localStorage.getItem('projectId');
    });

    this.loadNote();
  }

  private loadNote = () => {
    this._noteService.getNoteDetails(this.noteId, this.projectId).subscribe({
      next: (response) => {
        this._toastService.show('Note details fetch successfully!','SUCCESS', null);
        this.note = response.data.note;
        this.project = response.data.project;
      },
      error: (error) => {
        this._toastService.show(error.error.message,'DANGER', null);
      },
    });
  };

  protected removeNote = () =>{
    this._noteService.deleteNote(this.noteId, this.projectId).subscribe({
      next: () => {
        this._toastService.show('Note removed successfully!','SUCCESS', null);
        this.note = null;
        this.showNoteRemoveModal = false;
        this._router.navigate(['/home']);
      },
      error: (error) => {
        this._toastService.show(error.error.message,'DANGER', null);
      },
    });
  }

}
