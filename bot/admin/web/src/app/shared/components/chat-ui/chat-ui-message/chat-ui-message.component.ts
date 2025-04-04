import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BotMessage } from '../../../model/dialog-data';
import { BotApplicationConfiguration } from '../../../../core/model/configuration';
import { BotConfigurationService } from '../../../../core/bot-configuration.service';
import { take } from 'rxjs';

@Component({
  selector: 'tock-chat-ui-message',
  templateUrl: './chat-ui-message.component.html',
  styleUrls: ['./chat-ui-message.component.scss']
})
export class ChatUiMessageComponent {
  @Input() message: BotMessage;
  @Input() replay: boolean = false;
  @Input() sender?: string;
  @Input() date?: Date;
  @Input() applicationId?: string;
  @Input() switchFormattingPos: 'afterSender' | 'afterAvatar' = 'afterSender';

  @Input()
  set avatar(value: string) {
    this.avatarStyle = value ? this.domSanitizer.bypassSecurityTrustStyle(`url(${value})`) : null;
  }

  allConfigurations: BotApplicationConfiguration[];

  isMessageEmpty() {
    //@ts-ignore
    return !this.message.text?.trim().length && !this.message.messages?.length;
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

  formatting: boolean = true;

  @Output() sendMessage: EventEmitter<BotMessage> = new EventEmitter();

  constructor(protected domSanitizer: DomSanitizer, private botConfiguration: BotConfigurationService) {}

  ngOnInit() {
    this.botConfiguration.configurations.pipe(take(1)).subscribe((conf) => {
      this.allConfigurations = conf;
    });
  }

  getApplicationConfigurationName(short: boolean = true) {
    if (!this.allConfigurations || !this.applicationId) return;
    const configuration = this.allConfigurations.find((conf) => conf.applicationId === this.applicationId);
    if (configuration) {
      if (short) {
        return `${configuration.applicationId}`;
      } else {
        return `${configuration.name} > ${configuration.connectorType.label()} (${configuration.applicationId})`;
      }
    }

    return '';
  }

  replyMessage(message: BotMessage) {
    this.sendMessage.emit(message);
  }

  switchFormatting() {
    this.formatting = !this.formatting;
  }
}
