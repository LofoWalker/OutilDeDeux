import { QuestionsService } from './questions.service';
import { QuestionsData } from './questions.types';

describe('QuestionsService', () => {
  let service: QuestionsService;

  beforeEach(() => {
    service = new QuestionsService();
  });

  it('should load and parse questions.json correctly', () => {
    const data: QuestionsData = service.getQuestions();
    expect(data).toBeTruthy();
    expect(Array.isArray(data.categories)).toBeTrue();
    expect(data.categories.length).toBeGreaterThan(0);
    for (const cat of data.categories) {
      expect(typeof cat.nom).toBe('string');
      expect(Array.isArray(cat.questions)).toBeTrue();
      for (const q of cat.questions) {
        expect(typeof q.question).toBe('string');
        expect(Array.isArray(q.reponses)).toBeTrue();
        expect(typeof q.difficulte).toBe('number');
      }
    }
  });
});
