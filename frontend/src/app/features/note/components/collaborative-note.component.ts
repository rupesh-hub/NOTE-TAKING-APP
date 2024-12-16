import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Subscription,
} from 'rxjs';
import { WebsocketService } from '../websocket.service';
import { NoteService } from '../note.service';
import { ToastService } from '../../../core/toast.service';

interface Note {
  _id: string;
  id: string;
  title: string;
  content: string;
  project: any;
  comments: Comment[];
  images?: string[];
  createdBy: CreatedBy;
  updatedBy: UpdatedBy;
}

interface Comment {
  id: string;
  text: string;
  selectedText: string;
}

export interface CreatedBy {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile: string;
}

export interface UpdatedBy {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile: string;
}

@Component({
  selector: 'app-collaborative-note',
  templateUrl: './collaborative-note.component.html',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .highlighted-text {
        background-color: yellow;
        cursor: pointer;
      }
    `,
  ],
})
export class CollaborativeNoteComponent implements OnInit, OnDestroy {
  @ViewChild('editorContent', { static: true }) editorContent!: ElementRef;

  // Core note data
  note: Note = {
    _id: '',
    id: '',
    title: '',
    content: '',
    project: null,
    comments: [],
    images: [],
    createdBy: null,
    updatedBy: null,
  };

  private projectId = '';
  private noteSubscriptions: Subscription[] = [];

  // Image upload management
  uploadedImages: File[] = [];

  // Content change tracking
  private isExternalUpdate = false;

  // History management
  history: string[] = [];
  historyIndex = -1;

  // WebSocket status
  connectionStatus = 'Disconnected';

  constructor(
    private websocketService: WebsocketService,
    private noteService: NoteService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeRouteParams();
    this.loadNoteDetails();
    this.setupWebSocketConnection();
  }

  ngOnDestroy(): void {
    this.noteSubscriptions.forEach((sub) => sub.unsubscribe());
    this.websocketService.disconnect();
  }

  private initializeRouteParams(): void {
    const projectIdFromStorage = localStorage.getItem('projectId');
    this.projectId = projectIdFromStorage || '';

    this.noteSubscriptions.push(
      this.route.params.subscribe((params) => {
        this.note.id = params['id'];
      })
    );
  }

  private loadNoteDetails(): void {
    this.noteService.getNoteDetails(this.note.id, this.projectId).subscribe({
      next: (response) => {
        if (response?.success) {
          this._toastService.show('Note details fetched successfully!', 'SUCCESS', null);
          this.note = {
            ...this.note,
            ...response.data.note,
            project: response.data.project,
          };
          this.loadNoteContent(true);
        }
      },
      error: (err) => console.error('Failed to load note details', err),
    });
  }

  private setupWebSocketConnection(): void {
    // Connect to WebSocket
    this.websocketService
      .connect()
      .then(() => {
        this.connectionStatus = 'Connected';
        this.cdr.detectChanges();
        this.websocketService.joinProject(this.projectId);
      })
      .catch((error) => {
        console.error('WebSocket connection failed:', error);
        this.connectionStatus = 'Connection Failed';
        this.cdr.detectChanges();
      });

    // Listen to WebSocket events
    this.noteSubscriptions.push(
      this.websocketService.getNoteUpdates().subscribe((update) => {
        if (update.noteId === this.note.id) {
          this.handleNoteUpdate(update.updates);
        }
      })
    );

    //TODO
    this.websocketService.getUserJoined().subscribe((data) => {
      console.log('User joined:', data);
    });

    this.websocketService.socket?.on('disconnect', () => {
      console.warn('Disconnected from WebSocket');
      this.connectionStatus = 'Disconnected';
      this.cdr.detectChanges();
    });

    this.websocketService.socket?.on('connect', () => {
      console.log('Reconnected to WebSocket');
      this.connectionStatus = 'Connected';
      this.cdr.detectChanges();
    });

    this.websocketService.socket?.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connectionStatus = 'Connection Error';
      this.cdr.detectChanges();
    });
  }

  private handleNoteUpdate(updates: any): void {
    if (updates.content && updates.content !== this.note.content) {
      this.note.content = updates.content;
      this.isExternalUpdate = true;
      this.loadNoteContent(false);
    }

    if (updates.images) {
      this.note.images = updates.images;
      this.cdr.detectChanges();
    }
  }

  onContentChange(event: Event): void {
    const updatedContent = (event.target as HTMLElement).innerHTML;
    this.note.content = updatedContent || '';

    // Queue content change with WebSocket service
    this.websocketService.sendNoteUpdate(this.note._id, this.projectId, {
      content: updatedContent,
    });
  }

  uploadImages(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      const uploadedImages = Array.from(files);
      const formData = new FormData();

      formData.append('title', this.note.title);
      formData.append('content', this.editorContent.nativeElement.innerHTML);
      uploadedImages.forEach((file) => formData.append('images', file));

      this.noteService
        .updateNote(this.note._id, formData, this.projectId)
        .subscribe({
          next: (response) => {
            if (response?.data) {
              this._toastService.show('Image uploaded successfully!', 'SUCCESS', null);
              this.note.images = response.data.images;

              // Emit WebSocket update AFTER successful database save
              this.websocketService.sendNoteUpdate(
                this.note._id,
                this.projectId,
                {
                  images: response.data.images,
                }
              );
            }
          },
          error: (err) => console.error('Image upload failed', err),
        });
    }
  }

  loadNoteContent(isInitialLoad: boolean) {
    if (this.editorContent?.nativeElement) {
      const selection = window.getSelection();
      let cursorPosition = null;
      let selectedRange: Range | null = null;

      if (selection && selection.rangeCount > 0) {
        selectedRange = selection.getRangeAt(0);
        cursorPosition = selectedRange.startOffset;
      }

      if (isInitialLoad || this.isExternalUpdate) {
        this.editorContent.nativeElement.innerHTML = this.note.content || '';
      }

      if (cursorPosition !== null && selectedRange && selection) {
        const el = this.editorContent.nativeElement;
        const newRange = document.createRange();
        const textNode = el.firstChild;

        if (textNode) {
          newRange.setStart(textNode, cursorPosition);
          newRange.setEnd(textNode, cursorPosition);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }

      this.isExternalUpdate = false;
      this.cdr.detectChanges();
    }
  }

  applyFormat(type: string) {
    const selection = window.getSelection();
    let cursorPosition = null;
    let selectedRange: Range | null = null;

    if (selection && selection.rangeCount > 0) {
      selectedRange = selection.getRangeAt(0);
      cursorPosition = selectedRange.startOffset;
    }

    document.execCommand(type, false, '');

    this.loadNoteContent(false);
    if (cursorPosition !== null && selectedRange) {
      this.restoreCursor(cursorPosition, selectedRange);
    }
  }

  private restoreCursor(cursorPosition: number, selectedRange: Range) {
    const selection = window.getSelection();
    const range = document.createRange();
    const el = this.editorContent.nativeElement;
    const textNode = el.firstChild;

    if (textNode) {
      range.setStart(textNode, cursorPosition);
      range.setEnd(textNode, cursorPosition);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
  }

  private saveHistory() {
    this.history.push(this.note.content);
    this.historyIndex++;
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  changeFontFamily(event: Event) {
    const select = event.target as HTMLSelectElement;
    document.execCommand('fontName', false, select.value);
  }

  changeFontSize(event: Event) {
    const select = event.target as HTMLSelectElement;
    document.execCommand('fontSize', false, select.value);
  }

  changeTextColor(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    document.execCommand('foreColor', false, color);
  }

  alignText(alignment: 'left' | 'center' | 'right') {
    document.execCommand(
      `justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`,
      false,
      ''
    );
  }

  insertList(type: 'ul' | 'ol') {
    document.execCommand(
      type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList',
      false,
      ''
    );
    this.saveHistory();
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
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreFromHistory();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreFromHistory();
    }
  }

  private restoreFromHistory() {
    this.editorContent.nativeElement.innerHTML =
      this.history[this.historyIndex];
    this.onContentChange({ target: this.editorContent.nativeElement } as any);
  }

  insertImageIntoEditor(imageDataUrl: string) {
    const img = document.createElement('img');
    img.src = imageDataUrl;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    document.execCommand('insertHTML', false, img.outerHTML);
    this.saveHistory();
    this.onContentChange({ target: this.editorContent.nativeElement } as any);
  }

  removeImage(image:any){
    this._toastService.show('Image removed successfully!','SUCCESS', null);
  }
}
