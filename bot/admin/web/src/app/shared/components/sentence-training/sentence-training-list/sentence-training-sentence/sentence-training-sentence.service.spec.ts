import { TestBed } from '@angular/core/testing';

import { SentenceTrainingSentenceService } from './sentence-training-sentence.service';

describe('SentenceTrainingSentenceService', () => {
  let service: SentenceTrainingSentenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SentenceTrainingSentenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
