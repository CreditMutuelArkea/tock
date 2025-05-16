/*
 * Copyright (C) 2017/2025 SNCF Connect & Tech
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BotMessage, Sentence } from '../../../../model/dialog-data';

@Component({
  selector: 'tock-chat-ui-message-sentence',
  templateUrl: './chat-ui-message-sentence.component.html',
  styleUrls: ['./chat-ui-message-sentence.component.scss']
})
export class ChatUiMessageSentenceComponent {
  @Input() sentence: Sentence;

  @Input() replay: boolean;

  @Input() reply: boolean = false;

  @Input() formatting: boolean = true;

  @Output() sendMessage: EventEmitter<BotMessage> = new EventEmitter();

  replyMessage(message: BotMessage) {
    this.sendMessage.emit(message);
  }
}
