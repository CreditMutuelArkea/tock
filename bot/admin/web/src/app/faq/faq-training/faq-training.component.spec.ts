import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NbSpinnerModule, NbToastrService, NbToggleModule } from '@nebular/theme';
import { of, Subject } from 'rxjs';

import { StateService } from '../../core-nlp/state.service';
import { Classification, PaginatedResult, SentenceStatus } from '../../model/nlp';
import { NlpService } from '../../nlp-tabs/nlp.service';
import { TestSharedModule } from '../../shared/test-shared.module';
import { FaqTrainingComponent, SentenceExtended } from './faq-training.component';

const mockSentences: SentenceExtended[] = [
  {
    text: 'sentence 1',
    status: SentenceStatus.inbox,
    classification: <Classification>{
      intentId: '1',
      intentProbability: 1,
      entitiesProbability: 1
    },
    creationDate: new Date('2022-08-03T09:50:24.952Z'),
    _selected: true,
    getIntentLabel(_state) {
      return 'intent label';
    }
  } as SentenceExtended,
  {
    text: 'sentence 2',
    status: SentenceStatus.inbox,
    classification: <Classification>{
      intentId: '1',
      intentProbability: 1,
      entitiesProbability: 1
    },
    creationDate: new Date('2022-08-03T09:50:24.952Z'),
    _selected: false,
    getIntentLabel(_state) {
      return 'intent label';
    }
  } as SentenceExtended,
  {
    text: 'sentence 3',
    status: SentenceStatus.inbox,
    classification: <Classification>{
      intentId: '1',
      intentProbability: 1,
      entitiesProbability: 1
    },
    creationDate: new Date('2022-08-03T09:50:24.952Z'),
    _selected: false,
    getIntentLabel(_state) {
      return 'intent label';
    }
  } as SentenceExtended,
  {
    text: 'sentence 4',
    status: SentenceStatus.inbox,
    classification: <Classification>{
      intentId: '1',
      intentProbability: 1,
      entitiesProbability: 1
    },
    creationDate: new Date('2022-08-03T09:50:24.952Z'),
    _selected: false,
    getIntentLabel(_state) {
      return 'intent label';
    }
  } as SentenceExtended
];

const mockSentencesPaginatedResult: PaginatedResult<SentenceExtended> = {
  end: mockSentences.length,
  rows: mockSentences,
  start: 0,
  total: mockSentences.length
};

class StateServiceMock {
  createPaginatedQuery() {
    return {
      namespace: 'app',
      application: 'app',
      language: 'fr',
      start: 0,
      size: 10
    };
  }

  configurationChange: Subject<boolean> = new Subject();
}

class NlpServiceMock {
  searchSentences() {
    return of(mockSentencesPaginatedResult);
  }
}

describe('FaqTrainingComponent', () => {
  let component: FaqTrainingComponent;
  let fixture: ComponentFixture<FaqTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FaqTrainingComponent],
      imports: [TestSharedModule, NbSpinnerModule, NbToggleModule],
      providers: [
        { provide: NlpService, useClass: NlpServiceMock },
        { provide: StateService, useClass: StateServiceMock },
        { provide: NbToastrService, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
