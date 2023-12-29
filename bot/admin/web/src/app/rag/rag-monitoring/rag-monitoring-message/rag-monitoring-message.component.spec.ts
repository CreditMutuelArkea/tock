import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagMonitoringMessageComponent } from './rag-monitoring-message.component';

describe('RagMonitoringMessageComponent', () => {
  let component: RagMonitoringMessageComponent;
  let fixture: ComponentFixture<RagMonitoringMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RagMonitoringMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RagMonitoringMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
