import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BotMessage, SentenceElement } from '../../../../model/dialog-data';

@Component({
  selector: 'tock-chat-ui-message-sentence-element',
  templateUrl: './chat-ui-message-sentence-element.component.html',
  styleUrls: ['./chat-ui-message-sentence-element.component.scss']
})
export class ChatUiMessageSentenceElementComponent {
  @Input() element: SentenceElement;

  @Input() replay: boolean;

  @Input() reply: boolean;

  @Output() sendMessage: EventEmitter<BotMessage> = new EventEmitter();

  replyMessage(message: BotMessage) {
    this.sendMessage.emit(message);
  }
}
