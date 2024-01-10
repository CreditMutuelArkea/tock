import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagMonitoringSentenceElementComponent } from './rag-monitoring-sentence-element.component';

describe('RagMonitoringSentenceElementComponent', () => {
  let component: RagMonitoringSentenceElementComponent;
  let fixture: ComponentFixture<RagMonitoringSentenceElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RagMonitoringSentenceElementComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RagMonitoringSentenceElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
