export interface Question {
  question: string;
  reponses: string[];
  difficulte: number;
}

export interface Categorie {
  nom: string;
  questions: Question[];
}

export interface QuestionsData {
  categories: Categorie[];
}
