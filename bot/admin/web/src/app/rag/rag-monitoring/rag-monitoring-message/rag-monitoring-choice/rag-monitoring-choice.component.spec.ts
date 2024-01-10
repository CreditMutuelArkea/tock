import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagMonitoringChoiceComponent } from './rag-monitoring-choice.component';

describe('RagMonitoringChoiceComponent', () => {
  let component: RagMonitoringChoiceComponent;
  let fixture: ComponentFixture<RagMonitoringChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RagMonitoringChoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RagMonitoringChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
