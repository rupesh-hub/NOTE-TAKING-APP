import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../model/project.model';
import { ProjectService } from '../../project.service';
import {
  faUsers,
  faEye,
  faUserPlus,
  faAdd,
  faTrashCan,
  faCancel,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import {
  faEdit,
  faSave,
  faStickyNote,
  faTimesCircle,
} from '@fortawesome/free-regular-svg-icons';
import { UserService } from '../../../user/user.service';
import { NoteService } from '../../../note/note.service';

interface UserSearchResponse {
  id: string;
  name: string;
  email: string;
  profileImage: string;
}

interface CollaboratorInviteRequest {
  userId: string;
  projectId: string;
  authority: 'VIEWER' | 'EDITOR';
}

@Component({
  selector: 'ccnta-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  private _router: Router = inject(Router);
  project: any;
  projectId: string = '1';
  protected faUsers = faUsers;
  protected faEye = faEye;
  protected faUserPlus = faUserPlus;
  protected faNoteSticky = faStickyNote;
  protected faAdd = faAdd;
  protected faTrashCan = faTrashCan;
  protected faEdit = faEdit;
  protected faSave = faSave;
  protected faCancel = faCancel;
  protected faSearch = faSearch;
  protected faTimesCircle = faTimesCircle;

  isEditing = false;
  editedProject!: any;

  // search collaborator
  showInviteSection = false;
  searchEmail = '';
  selectedAuthority: 'VIEWER' | 'EDITOR' = 'VIEWER';
  foundUser: any;

  showRemoveModal = false;
  selectedCollaborator: any = null;

  showNoteRemoveModal = false;
  selectedNote: any = null;

  showProjectRemoveModal = false;

  authorities = {
    viewer: false,
    editor: false,
  };

  private _userService: UserService = inject(UserService);
  private _noteService: NoteService = inject(NoteService);

  startEditing() {
    this.editedProject = { ...this.project };
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
  }

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get the project ID from the route parameters
    this.route.params.subscribe((params) => {
      this.projectId = params['projectId'];
      localStorage.setItem('projectId', this.projectId);
      this.fetchProjectDetails();
    });
  }

  fetchProjectDetails() {
    this.projectService.getById(this.projectId).subscribe((data: any) => {
      if (data.success) {
        this.project = data.project;
      }
    });
  }

  saveProject() {
    // Validate inputs
    if (!this.validateProject(this.editedProject)) {
      alert('Please fill in all fields');
      return;
    }

    const request = {
      id: this.editedProject._id,
      title: this.editedProject.title,
      description: this.editedProject.description,
    };

    this.projectService.update(request).subscribe({
      next: () => {
        this.project = this.editedProject;
        this.isEditing = false;
      },
      error: (error) => console.error('Error updating project', error),
    });
  }

  private validateProject(project: Project): boolean {
    return !!(project.title?.trim() && project.description?.trim());
  }

  toggleInviteSection() {
    this.showInviteSection = !this.showInviteSection;
  }

  searchUserByEmail() {
    if (this.searchEmail) {
      this._userService
        .searchUserByEmail(this.searchEmail)
        .subscribe((response: any) => {
          this.foundUser = response.user;
          this.searchEmail = '';
        });
    }
  }

  inviteCollaborator() {
    const selectedAuthorities = [];

    if (this.authorities.viewer) {
      selectedAuthorities.push('viewer');
    }
    if (this.authorities.editor) {
      selectedAuthorities.push('editor');
    }

    const request = {
      [this.foundUser.email]: selectedAuthorities,
    };

    this.projectService.addCollaborators(request, this.project._id).subscribe({
      next: (response: any) => {
        this.project.collaborators.push(response.data);
        this.resetInviteSection();
      },
      error: (error) => console.error('Error adding collaborators', error),
    });
  }

  resetInviteSection() {
    this.authorities = {
      viewer: false,
      editor: false,
    };
    this.showInviteSection = false;
    this.searchEmail = '';
    this.foundUser = null;
  }

  openRemoveCollaboratorModal(collaborator: any) {
    this.selectedCollaborator = collaborator;
    this.showRemoveModal = true;
  }

  closeRemoveModal() {
    this.showRemoveModal = false;
    this.selectedCollaborator = null;
  }

  removeCollaborator() {
    if (this.selectedCollaborator) {
      const request = { email: this.selectedCollaborator.email };

      this.projectService
        .removeCollaborators(request, this.project._id)
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              // Remove collaborator from project
              this.project.collaborators = this.project.collaborators.filter(
                (collab) => collab.user._id !== response.data.collaboratorId
              );
            }
          },
          error: (error) =>
            console.error('Error removing collaborators', error),
        });

      this.closeRemoveModal();
    }
  }

  openRemoveProjectModal(): void {
    this.showProjectRemoveModal = true;
  }
  closeProjectRemoveModal() {
    this.showProjectRemoveModal = false;
  }

  openRemoveNoteModal(note: any) {
    this.selectedNote = note;
    this.showNoteRemoveModal = true;
  }

  closeNoteRemoveModal() {
    this.showNoteRemoveModal = false;
    this.selectedNote = null;
  }

  deleteProject(projectId: string) {
    this.projectService.delete(projectId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this._router.navigate(['/projects']);
        }
      },
      error: (error) => console.error('Error deleting project', error),
    });
  }

  removeNote() {
    if (this.selectedNote) {
      this._noteService
        .deleteNote(this.selectedNote._id, this.projectId)
        .subscribe({
          next: (response: any) => {
            if (response && response.data && response.data._id) {
              this.project.notes = this.project.notes.filter(
                (note: any) => note._id != response.data._id
              );
              this.showNoteRemoveModal = false;
            } else {
              console.warn(
                'Unexpected response while deleting note:',
                response
              );
            }
          },
          error: (error) => {
            console.error('Error removing note:', error);
          },
        });

      // Ensure modal is properly closed if there's an error or cancellation
      this.closeRemoveModal();
    }
  }
}
