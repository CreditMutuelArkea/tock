import { TestBed } from '@angular/core/testing';

import { SentencesGenerationService } from './sentences-generation.service';

describe('SentencesGenerationService', () => {
  let service: SentencesGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SentencesGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
