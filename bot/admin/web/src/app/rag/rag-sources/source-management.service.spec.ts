import { TestBed } from '@angular/core/testing';
import { RestService } from '../../core-nlp/rest/rest.service';
import { SourceManagementApiService } from './source-management.api.service';

import { SourceManagementService } from './source-management.service';

describe('SourceManagementService', () => {
  let service: SourceManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RestService, useValue: {} },
        {
          provide: SourceManagementApiService,
          useValue: {
            getSources: () => {},
            postSource: (source) => {},
            updateSource: (sourcePartial) => {},
            deleteSource: (sourceId) => {},
            postIndexingSession: (source, data) => {},
            getIndexingSession: (source, session) => {},
            deleteIndexingSession: (source, session) => {}
          }
        }
      ]
    });
    service = TestBed.inject(SourceManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
