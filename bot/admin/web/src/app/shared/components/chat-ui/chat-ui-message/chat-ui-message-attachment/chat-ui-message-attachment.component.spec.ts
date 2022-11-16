import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUiMessageAttachmentComponent } from './chat-ui-message-attachment.component';

describe('ChatUiMessageAttachmentComponent', () => {
  let component: ChatUiMessageAttachmentComponent;
  let fixture: ComponentFixture<ChatUiMessageAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatUiMessageAttachmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatUiMessageAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
