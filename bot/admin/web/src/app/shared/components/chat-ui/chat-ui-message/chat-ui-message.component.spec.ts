import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BotMessage, Sentence } from '../../../model/dialog-data';

import { ChatUiMessageComponent } from './chat-ui-message.component';

const message = new Sentence(0, [], 'test');

describe('ChatUiMessageComponent', () => {
  let component: ChatUiMessageComponent;
  let fixture: ComponentFixture<ChatUiMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatUiMessageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatUiMessageComponent);
    component = fixture.componentInstance;
    component.message = message;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
