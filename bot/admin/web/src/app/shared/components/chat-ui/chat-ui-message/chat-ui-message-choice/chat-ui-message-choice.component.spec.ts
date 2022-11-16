import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUiMessageChoiceComponent } from './chat-ui-message-choice.component';

describe('ChatUiMessageChoiceComponent', () => {
  let component: ChatUiMessageChoiceComponent;
  let fixture: ComponentFixture<ChatUiMessageChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatUiMessageChoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatUiMessageChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
