import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagMonitoringSentenceComponent } from './rag-monitoring-sentence.component';

describe('RagMonitoringSentenceComponent', () => {
  let component: RagMonitoringSentenceComponent;
  let fixture: ComponentFixture<RagMonitoringSentenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RagMonitoringSentenceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RagMonitoringSentenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
