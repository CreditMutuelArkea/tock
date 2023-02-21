import { TestBed } from '@angular/core/testing';

import { SentencesGenerationApiService } from './sentences-generation-api.service';

describe('SentencesGenerationApiService', () => {
  let service: SentencesGenerationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SentencesGenerationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
