import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagMonitoringLocationComponent } from './rag-monitoring-location.component';

describe('RagMonitoringLocationComponent', () => {
  let component: RagMonitoringLocationComponent;
  let fixture: ComponentFixture<RagMonitoringLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RagMonitoringLocationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RagMonitoringLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
