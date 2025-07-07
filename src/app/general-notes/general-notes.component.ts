import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'general-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './general-notes.component.html',
  styleUrls: ['./general-notes.component.sass']
})
export class GeneralNotesComponent {
  generalNotes: string = '';
  isMinimized: boolean = false;
  faPenToSquare = faPenToSquare;

  ngOnInit() {
    this.loadGeneralNotes();
    const minimized = localStorage.getItem('general-notes-minimized');
    this.isMinimized = minimized === 'true';
  }

  saveGeneralNotes() {
    localStorage.setItem('general-notes', this.generalNotes);
  }

  loadGeneralNotes() {
    const notes = localStorage.getItem('general-notes');
    if (notes !== null) {
      this.generalNotes = notes;
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    localStorage.setItem('general-notes-minimized', this.isMinimized ? 'true' : 'false');
  }
}
