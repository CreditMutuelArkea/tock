import { TestBed } from '@angular/core/testing';

import { RagMonitoringService } from './rag-monitoring.service';

describe('RagMonitoringService', () => {
  let service: RagMonitoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RagMonitoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
