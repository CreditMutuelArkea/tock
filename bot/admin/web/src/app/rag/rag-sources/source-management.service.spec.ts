import { TestBed } from '@angular/core/testing';

import { SourceManagementService } from './source-management.service';

describe('SourceManagementService', () => {
  let service: SourceManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SourceManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
