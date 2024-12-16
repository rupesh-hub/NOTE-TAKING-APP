import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { NoteService } from '../../note.service';
import { ToastService } from '../../../../core/toast.service';

interface Note {
  _id?: string;
  title: string;
  content: string;
  images: string[];
  project: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'ccnta-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss']
})
export class NoteEditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorContent') editorContent!: ElementRef;

  currentNote: Note | null = null;
  projectId: string = '';
  uploadedImages: File[] = [];
  savedImages: string[] = [];

  private history: string[] = [];
  private historyIndex: number = -1;
  private contentChanged = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private noteService: NoteService,
    private route: ActivatedRoute,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';

    this.contentChanged.pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.saveDocument();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get canUndo(): boolean {
    return this.historyIndex > 0;
  }

  get canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  get hasImages(): boolean {
    return this.uploadedImages.length > 0 || this.savedImages.length > 0;
  }

  applyFormat(type: 'bold' | 'italic' | 'underline') {
    document.execCommand(type, false, '');
    this.saveHistory();
    this.contentChanged.next(this.editorContent.nativeElement.innerHTML);
  }

  changeTextColor(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    document.execCommand('foreColor', false, color);
    this.saveHistory();
    this.contentChanged.next(this.editorContent.nativeElement.innerHTML);
  }

  changeFontFamily(event: Event) {
    const font = (event.target as HTMLSelectElement).value;
    document.execCommand('fontName', false, font);
    this.contentChanged.next(this.editorContent.nativeElement.innerHTML);
  }

  changeFontSize(event: Event) {
    const size = (event.target as HTMLSelectElement).value;
    document.execCommand('fontSize', false, size);
    this.contentChanged.next(this.editorContent.nativeElement.innerHTML);
  }

  alignText(alignment: 'left' | 'center' | 'right') {
    document.execCommand(
      `justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`,
      false,
      ''
    );
    this.contentChanged.next(this.editorContent.nativeElement.innerHTML);
  }

  insertList(type: 'ul' | 'ol') {
    document.execCommand(
      type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList',
      false,
      ''
    );
    this.saveHistory();
    this.contentChanged.next(this.editorContent.nativeElement.innerHTML);
  }

  insertTable() {
    const table = `
      <table class="w-full border-collapse border border-gray-300">
        <tr>
          <td class="border border-gray-300 p-2">Cell 1</td>
          <td class="border border-gray-300 p-2">Cell 2</td>
        </tr>
      </table>
    `;
    document.execCommand('insertHTML', false, table);
    this.saveHistory();
    this.contentChanged.next(this.editorContent.nativeElement.innerHTML);
  }

  saveHistory() {
    const content = this.editorContent.nativeElement.innerHTML;

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(content);
    this.historyIndex++;
  }

  undo() {
    if (this.canUndo) {
      this.historyIndex--;
      this.restoreFromHistory();
    }
  }

  redo() {
    if (this.canRedo) {
      this.historyIndex++;
      this.restoreFromHistory();
    }
  }

  private restoreFromHistory() {
    this.editorContent.nativeElement.innerHTML = this.history[this.historyIndex];
    this.contentChanged.next(this.editorContent.nativeElement.innerHTML);
  }

  saveDocument() {
    const content = this.editorContent.nativeElement.innerHTML;
    const title = this.generateTitle(content) || new Date().toString();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('status', 'active');

    this.uploadedImages.forEach((image, index) => {
      formData.append(`images`, image);
    });

    if (this.currentNote && this.currentNote._id) {
      this.updateExistingNote(formData);
    } else {
      this.createNewNote(formData);
    }
  }

  private generateTitle(content: string): string {
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.split(/\s+/);
    return words.slice(0, 10).join(' ');
  }

  private createNewNote(formData: FormData) {
    this.noteService.createNote(formData, this.projectId).subscribe(
      (response) => {
        if (response && response.data) {
          this._toastService.show('Note saved successfully!','SUCCESS', null);
          this.currentNote = response.data;
          this.savedImages = this.currentNote.images;
          this.uploadedImages = [];
        }
      }
    );
  }

  private updateExistingNote(formData: FormData) {
    if (!this.currentNote || !this.currentNote._id) return;

    this.noteService.updateNote(this.currentNote._id, formData, this.projectId).subscribe(
      (response) => {
        if (response && response.data) {
          this._toastService.show('Note updated successfully!','SUCCESS', null);
          this.currentNote = response.data;
          this.savedImages = this.currentNote.images;
          this.uploadedImages = [];
        }
      }
    );
  }

  uploadImages(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.uploadedImages.push(files[i]);
      }
      this.contentChanged.next(this.editorContent.nativeElement.innerHTML);
    }
  }

  onContentChanged(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.contentChanged.next(target.innerHTML);
  }
}
