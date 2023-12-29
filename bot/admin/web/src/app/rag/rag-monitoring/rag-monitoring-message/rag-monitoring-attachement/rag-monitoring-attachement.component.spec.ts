import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagMonitoringAttachementComponent } from './rag-monitoring-attachement.component';

describe('RagMonitoringAttachementComponent', () => {
  let component: RagMonitoringAttachementComponent;
  let fixture: ComponentFixture<RagMonitoringAttachementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RagMonitoringAttachementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RagMonitoringAttachementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
