import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionsService } from '../questions/questions.service';
import { QuestionsData } from '../questions/questions.types';
import { QuestionsListComponent } from '../questions-list/questions-list.component';
import { HeaderComponent } from '../../header/header.component';
import { InterviewSummaryComponent } from '../../interview-summary/interview-summary.component';

@Component({
  selector: 'questions-container',
  standalone: true,
  imports: [CommonModule, QuestionsListComponent, HeaderComponent, InterviewSummaryComponent],
  templateUrl: './questions-container.component.html',
  styleUrl: './questions-container.component.sass'
})
export class QuestionsContainerComponent {
  questionsData: QuestionsData;
  categories: string[] = [];
  activeCategory: string = '';
  filteredQuestionsData: QuestionsData = { categories: [] };
  allDifficultes = [
    { value: 1, label: 'Junior' },
    { value: 2, label: 'Confirmé' },
    { value: 3, label: 'Senior' },
    { value: 4, label: 'Expert' }
  ];
  difficultes = this.allDifficultes;
  activeDifficulte: number | null = null;
  ratings: { [id: string]: number } = {};
  comments: { [id: string]: string } = {};
  generalNotes: string = '';
  generalNotesVisible = true;
  showSummary = false;
  @ViewChild('interviewSummary') interviewSummary: any;

  constructor(private questionsService: QuestionsService) {
    this.questionsData = this.questionsService.getQuestions();
    this.categories = this.questionsData.categories.map(c => c.nom);
    this.activeCategory = this.categories[0] || '';
    this.updateFilteredQuestions();
  }

  onCategoryChange(cat: string) {
    this.activeCategory = cat;
    this.activeDifficulte = null;
    this.updateFilteredQuestions();
  }

  onDifficulteChange(diff: number | null) {
    this.activeDifficulte = diff;
    this.updateFilteredQuestions();
  }

  updateFilteredQuestions() {
    const cat = this.questionsData.categories.find(c => c.nom === this.activeCategory);
    if (!cat) {
      this.filteredQuestionsData = { categories: [] };
      this.difficultes = this.allDifficultes;
      return;
    }
    let questions = cat.questions;
    const presentDifficultes = Array.from(new Set(questions.map(q => q.difficulte)));
    this.difficultes = this.allDifficultes.filter(d => presentDifficultes.includes(d.value));
    if (this.activeDifficulte && !presentDifficultes.includes(this.activeDifficulte)) {
      this.activeDifficulte = null;
    }
    if (this.activeDifficulte) {
      questions = questions.filter(q => q.difficulte === this.activeDifficulte);
    }
    this.filteredQuestionsData = { categories: [{ nom: cat.nom, questions }] };
  }

  getDifficulteLabel(diff: number): string {
    const found = this.allDifficultes.find(d => d.value === diff);
    return found ? found.label : '';
  }

  onExportSummary() {
    console.log('Exporting interview summary...');
    if (this.interviewSummary && this.interviewSummary.openModal) {
      this.interviewSummary.openModal();
    }
  }

  collectRatingsAndComments() {
    // Récupérer les données du localStorage (mêmes clés que dans QuestionsListComponent)
    const data = localStorage.getItem('questions-answers');
    this.ratings = {};
    this.comments = {};
    if (data) {
      const arr = JSON.parse(data);
      for (const entry of arr) {
        this.ratings[entry.id] = entry.rating;
        this.comments[entry.id] = entry.comment;
      }
    }
    this.generalNotes = localStorage.getItem('general-notes') || '';
  }

  toggleGeneralNotes() {
    this.generalNotesVisible = !this.generalNotesVisible;
  }
}
