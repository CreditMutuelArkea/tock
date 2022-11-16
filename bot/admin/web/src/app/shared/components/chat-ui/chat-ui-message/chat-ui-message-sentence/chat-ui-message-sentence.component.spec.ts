import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUiMessageSentenceComponent } from './chat-ui-message-sentence.component';

describe('ChatUiMessageSentenceComponent', () => {
  let component: ChatUiMessageSentenceComponent;
  let fixture: ComponentFixture<ChatUiMessageSentenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatUiMessageSentenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatUiMessageSentenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
