import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagSourcesBoardComponent } from './rag-sources-board.component';

describe('BoardComponent', () => {
  let component: RagSourcesBoardComponent;
  let fixture: ComponentFixture<RagSourcesBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RagSourcesBoardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RagSourcesBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
