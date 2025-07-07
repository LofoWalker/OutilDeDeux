import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { generateInterviewSummary } from './interview-summary.util';
import { QuestionsData } from '../questions/questions/questions.types';

@Component({
  selector: 'interview-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-summary.component.html',
  styleUrls: ['./interview-summary.component.sass']
})
export class InterviewSummaryComponent {
  @Input() questionsData!: QuestionsData;
  @Input() ratings!: { [id: string]: number };
  @Input() comments!: { [id: string]: string };
  @Input() generalNotes!: string;

  showModal = false;
  copied = false;

  get markdown(): string {
    return generateInterviewSummary();
  }

  openModal() {
    this.showModal = true;
    this.copied = false;
  }

  closeModal() {
    this.showModal = false;
    this.copied = false;
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.markdown).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 1500);
    });
  }

  exportSummary() {
    const blob = new Blob([this.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-entretien.md';
    a.click();
    URL.revokeObjectURL(url);
  }
}
