import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagMonitoringComponent } from './rag-monitoring.component';

describe('RagMonitoringComponent', () => {
  let component: RagMonitoringComponent;
  let fixture: ComponentFixture<RagMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RagMonitoringComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RagMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
