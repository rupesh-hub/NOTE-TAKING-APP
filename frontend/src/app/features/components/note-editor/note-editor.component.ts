import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { faImage, faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectCardComponent } from '../../../shared/pages/project-card.component';
import { HtmlViewerComponent } from '../../../shared/pages/html-viewer.component';

@Component({
  selector: 'nta-note-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorModule,
    FontAwesomeModule,
    ProjectCardComponent,
    HtmlViewerComponent,
  ],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
  ],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.scss',
})
export class NoteEditorComponent implements OnInit {
  faFileImage = faImage;
  faTrashAlt = faTrashAlt;
  faEdit = faEdit;

  myForm: FormGroup;
  newDraftContent: string = '';
  editedIndex: number | null = null;
  protected projectId: string;
  protected project: any;
  protected notes: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {
    this.myForm = this.formBuilder.group({
      content: '',
      title: '',
      projectId: '',
    });
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.projectId = params.get('projectId');
      localStorage.setItem('active-project-id', this.projectId);
    });

    //hit backend to fetch notes related to particular project
    this.projectService.viewProjectById(this.projectId).subscribe({
      next: (response: any) => {
        this.project = response.project;
        this.notes = response.notes;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  onSubmit() {
    this.myForm.get('projectId').setValue(this.projectId);
    this.projectService.createNote(this.myForm.value).subscribe({
      next: (response: any) => {
        console.log(response);

        this.notes.unshift({
          createAt: response.createAt,
          _id:response._id,
          content:response.content,
          title:response.title
        }); 
        this.myForm.reset();
        
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  
  }

  editorInit = {
    base_url: '/tinymce',
    suffix: '.min',
    plugins: 'lists link image table code help wordcount',
    toolbar:
      'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
    images_upload_url: '/upload-endpoint',
    file_picker_types: 'image',
    file_picker_callback: (cb, value, meta) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            cb(reader.result as string, { alt: file.name });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    },
    statusbar: false,
    branding: false,
  };

  draftNotes: any = [
    {
      content: 'Draft content for the third note. Almost done!',
      date: new Date().toISOString(),
    },
    {
      content:
        "The fourth draft is now taking shape, but there are still some major revisions to be made. I've been thinking about how to improve the flow of the introduction, as it seems a bit too abrupt. The body paragraphs also need better transitions to guide the reader through the ideas more smoothly. Overall, the content is solid, but it could use a clearer structure and more supporting details to back up the main arguments. I plan to revisit this in the coming days with fresh ideas.",
      date: new Date().toISOString(),
    },
    {
      content:
        "In this fifth draft, I've gone over the first section and reworked several sentences to make the meaning clearer. The second section still needs a lot of work, especially the conclusion. I feel like it's too weak and doesn't effectively summarize the main points of the article.",
      date: new Date().toISOString(),
    },
  ];

  protected saveDraft() {
    if (this.newDraftContent.trim()) {
      const newNote = {
        content: this.newDraftContent.trim(),
        date: new Date().toISOString(), // Current date and time
      };

      // Add the new note at the top of the draft notes array
      this.draftNotes.unshift(newNote);

      // Clear the input field
      this.newDraftContent = '';
    }
  }

  // Method to delete a draft note
  deleteDraft(index: number) {
    this.draftNotes.splice(index, 1); // Remove the note at the specified index
  }

  // Method to edit a draft note
  editDraft(note: any) {
    this.newDraftContent = note.content; // Populate the input field with the content of the selected note
    this.editedIndex = this.draftNotes.indexOf(note); // Store the index of the note being edited
  }

  openImageUpload() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    // Handle file selection
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          // Add image to the most recent draft note
          const imageUrl = reader.result as string;
          const newNote = {
            content: this.newDraftContent.trim(),
            date: new Date().toISOString(),
            image: imageUrl, // Store the image URL
          };
          this.draftNotes.unshift(newNote); // Add image content to the top of the list
          this.newDraftContent = ''; // Clear the input field
        };
        reader.readAsDataURL(file); // Convert file to base64 string
      }
    };
    input.click(); // Open the file picker
  }

  protected deleteNote(id: string) {
    this.projectService.deleteNote(id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.notes = this.notes.filter((note: any) => note._id !== id);
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }
}
