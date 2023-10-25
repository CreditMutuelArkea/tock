import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import linkifyHtml from 'linkify-html';
import { BotMessage, Sentence } from '../../../../model/dialog-data';

@Component({
  selector: 'tock-chat-ui-message-sentence-footnotes',
  templateUrl: './chat-ui-message-sentence-footnotes.component.html',
  styleUrls: ['./chat-ui-message-sentence-footnotes.component.scss']
})
export class ChatUiMessageSentenceFootnotesComponent {
  @Input() sentence: Sentence;

  @Input() replay: boolean;

  @Input() reply: boolean = false;

  @Output() sendMessage: EventEmitter<BotMessage> = new EventEmitter();

  linkifyHtml(str) {
    return linkifyHtml(str, { target: '_blank' });
  }

  replyMessage(message: BotMessage) {
    this.sendMessage.emit(message);
  }
}
