import { Component, OnInit, inject } from '@angular/core';
import { 
  faEye, faTrashCan, faSort, faSortUp, faSortDown, 
  faAngleDoubleLeft, faChevronLeft, faChevronRight, 
  faAngleDoubleRight, faTimesCircle 
} from '@fortawesome/free-solid-svg-icons';
import { NoteService } from '../../note.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/toast.service';

// Define an interface for Note to improve type safety
interface Note {
  id: string;
  _id?: string;
  title: string;
  content: string;
  images?: string[];
  project?: Project;
}

interface Project{
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  status: string;
}

// Define an interface for pagination and filtering options
interface NotesQueryParams {
  status?: string;
  title?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent implements OnInit {
  // Icons
  protected readonly faEye = faEye;
  protected readonly faTrashCan = faTrashCan;
  protected readonly faSort = faSort;
  protected readonly faSortUp = faSortUp;
  protected readonly faSortDown = faSortDown;
  protected readonly faAngleDoubleLeft = faAngleDoubleLeft;
  protected readonly faChevronLeft = faChevronLeft;
  protected readonly faChevronRight = faChevronRight;
  protected readonly faAngleDoubleRight = faAngleDoubleRight;
  protected readonly faTimesCircle = faTimesCircle;

  // Dependency injection
  private readonly _noteService: NoteService = inject(NoteService);
  private readonly _router: Router = inject(Router);
  private readonly _toastService: ToastService = inject(ToastService);

  // Component state properties
  notes: Note[] = [];
  
  // Pagination
  currentPage = 1;
  readonly itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Filtering
  titleFilter = '';

  // Sorting
  sortColumn: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // UI state
  isLoading = false;
  showNoteRemoveModal = false;
  selectedNote: Note | null = null;

  // Column loading states
  columnLoadingStates: { [key: string]: boolean } = {
    createdAt: false,
    title: false
  };

  constructor() {}

  ngOnInit(): void {
    this.loadNotes();
  }

  // Centralized method for loading notes with comprehensive error handling
  private loadNotes(): void {
    // Reset loading state and prepare query parameters
    this.isLoading = true;
    const queryParams: NotesQueryParams = {
      status: 'active',
      title: this.titleFilter,
      sortBy: this.sortColumn,
      sortOrder: this.sortDirection
    };

    // Use pipe to handle loading state
    this._noteService.getAllNotes(
      this.currentPage, 
      this.itemsPerPage, 
      queryParams
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        // Reset column loading states
        Object.keys(this.columnLoadingStates).forEach(
          key => this.columnLoadingStates[key] = false
        );
      })
    ).subscribe({
      next: (response) => {
        // Transform notes to ensure consistent interface
        this._toastService.show('Note fetched successfully!', 'SUCCESS', null);
        this.notes = response.data.map(this.transformNote);
        this.totalItems = response.pagination.totalNotes;
        this.totalPages = response.pagination.totalPages;
      },
      error: (error) => {
        // Consider adding a toast or error notification service
        console.error('Error loading notes:', error);
      }
    });
  }

  // Transform note to ensure consistent interface
  private transformNote(note: any): Note {
    return {
      id: note._id,
      title: note.title,
      content: note.content,
      images: note.images || [],
      project: note.project
    };
  }

  // Debounced search method
  searchNotes(): void {
    this.currentPage = 1; // Reset to first page on new search
    this.loadNotes();
  }

  // Flexible sorting method with column loading state
  sortBy(column: string): void {
    // Set loading state for the specific column
    this.columnLoadingStates[column] = true;

    // Toggle sort direction
    this.sortColumn = column;
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    
    // Load notes with new sorting parameters
    this.loadNotes();
  }

  // Pagination method with input validation
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadNotes();
    }
  }

  // Modal management methods
  openRemoveNoteModal(note: Note): void {
    this.selectedNote = note;
    this.showNoteRemoveModal = true;
  }

  closeNoteRemoveModal(): void {
    this.selectedNote = null;
    this.showNoteRemoveModal = false;
  }

  // Note removal method with error handling
  removeNote(): void {

    if (!this.selectedNote) return;

    this._noteService.deleteNote(
      this.selectedNote.id, 
      this.selectedNote.project._id
    ).subscribe({
      next: () => {
        this._toastService.show('Note deleted successfully!', 'SUCCESS', null);
        this.loadNotes();
        this.closeNoteRemoveModal();
        
      },
      error: (error) => {
        this._toastService.show(error.error.message, 'DANGER', null);
      }
    });
  }

  protected view = (note:Note) => {
    console.log("NOTE===>", note)
    localStorage.setItem('projectId', note.project._id);
    this._router.navigate(['/home/notes/', note.id])
  }
}