import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'general-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="general-notes">
      <h3>Notes générales</h3>
      <textarea
        [(ngModel)]="generalNotes"
        (ngModelChange)="saveGeneralNotes()"
        placeholder="Prendre des notes générales sur l'entretien..."
        rows="12"
      ></textarea>
    </aside>
  `,
  styleUrls: ['./general-notes.component.sass']
})
export class GeneralNotesComponent {
  generalNotes: string = '';

  ngOnInit() {
    this.loadGeneralNotes();
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
}
