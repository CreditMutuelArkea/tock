import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogStatsComponent } from './log-stats.component';
import { StateService } from '../../core-nlp/state.service';
import { Subject } from 'rxjs';

class StateServiceMock {
  configurationChange: Subject<boolean> = new Subject();
}

describe('LogStatsComponent', () => {
  let component: LogStatsComponent;
  let fixture: ComponentFixture<LogStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogStatsComponent],
      providers: [
        {
          provide: StateService,
          useClass: StateServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
