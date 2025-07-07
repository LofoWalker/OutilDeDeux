import { Injectable } from '@angular/core';
import questions from '../../../../questions.json';
import { QuestionsData } from './questions.types';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  getQuestions(): QuestionsData {
    return questions as QuestionsData;
  }
}
