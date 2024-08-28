import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestIntentErrorsComponent } from './test-intent-errors.component';
import { StateService } from '../../core-nlp/state.service';
import { Subject, of } from 'rxjs';
import { QualityService } from '../quality.service';
import { NbToastrService } from '@nebular/theme';
import { DialogService } from '../../core-nlp/dialog.service';
import { RestService } from '../../core-nlp/rest/rest.service';
import { NlpService } from '../../core-nlp/nlp.service';

class StateServiceMock {
  currentApplication = { namespace: 'namespace', name: 'app' };
  configurationChange: Subject<boolean> = new Subject();
  createPaginatedQuery() {
    return {
      namespace: 'app',
      application: 'app',
      language: 'fr',
      start: 0,
      size: 10
    };
  }
}

class QualityServiceMock {
  searchIntentErrors() {
    return new Subject();
  }
}

describe('TestIntentErrorsComponent', () => {
  let component: TestIntentErrorsComponent;
  let fixture: ComponentFixture<TestIntentErrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestIntentErrorsComponent],
      providers: [
        {
          provide: StateService,
          useClass: StateServiceMock
        },
        {
          provide: QualityService,
          useClass: QualityServiceMock
        },
        { provide: NbToastrService, useValue: {} },
        { provide: DialogService, useValue: {} },
        { provide: RestService, useValue: { get: () => of() } },
        { provide: NlpService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestIntentErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
