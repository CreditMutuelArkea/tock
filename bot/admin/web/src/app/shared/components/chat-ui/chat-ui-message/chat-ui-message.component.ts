import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { NbDialogService } from '@nebular/theme';
import { BotMessage } from '../../../model/dialog-data';
import { DebugViewerComponent } from '../../debug-viewer/debug-viewer.component';

@Component({
  selector: 'tock-chat-ui-message',
  templateUrl: './chat-ui-message.component.html',
  styleUrls: ['./chat-ui-message.component.scss']
})
export class ChatUiMessageComponent {
  @Input() message: BotMessage;
  @Input() replay: boolean = false;
  @Input() sender: string;
  @Input() date: Date;
  @Input() debug?: any;

  @Input()
  set avatar(value: string) {
    this.avatarStyle = value ? this.domSanitizer.bypassSecurityTrustStyle(`url(${value})`) : null;
  }

  avatarStyle: SafeStyle;

  @HostBinding('class.not-reply')
  get notReply() {
    return !this.reply;
  }

  @Input()
  @HostBinding('class.reply')
  get reply(): boolean {
    return this._reply;
  }
  set reply(value: boolean) {
    this._reply = value;
  }
  protected _reply: boolean = false;

  @Output() sendMessage: EventEmitter<BotMessage> = new EventEmitter();

  constructor(protected domSanitizer: DomSanitizer, private nbDialogService: NbDialogService) {}

  replyMessage(message: BotMessage) {
    this.sendMessage.emit(message);
  }

  showDebug() {
    this.nbDialogService.open(DebugViewerComponent, {
      context: {
        debug: this.debug
      }
    });
  }
}
