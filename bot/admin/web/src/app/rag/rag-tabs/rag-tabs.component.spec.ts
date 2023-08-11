import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagTabsComponent } from './rag-tabs.component';

describe('RagTabsComponent', () => {
  let component: RagTabsComponent;
  let fixture: ComponentFixture<RagTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RagTabsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RagTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
