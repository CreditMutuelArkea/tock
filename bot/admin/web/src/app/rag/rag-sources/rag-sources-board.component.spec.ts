import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { of } from 'rxjs';
import { BotConfigurationService } from '../../core/bot-configuration.service';

import { RagSourcesBoardComponent } from './rag-sources-board.component';
import { SourceManagementService } from './source-management.service';

describe('BoardComponent', () => {
  let component: RagSourcesBoardComponent;
  let fixture: ComponentFixture<RagSourcesBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RagSourcesBoardComponent],
      providers: [
        {
          provide: BotConfigurationService,
          useValue: { configurations: of([]) }
        },
        {
          provide: NbDialogService,
          useValue: { open: () => {} }
        },
        {
          provide: NbToastrService,
          useValue: { success: () => {} }
        },
        {
          provide: SourceManagementService,
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
    }).compileComponents();

    fixture = TestBed.createComponent(RagSourcesBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
