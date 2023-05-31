/*
 * Copyright (C) 2017/2021 e-voyageurs technologies
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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BotMessageComponent } from './bot-message/bot-message.component';
import { SentenceElementComponent } from './bot-message/sentence-element.component';
import { BotMessageSentenceComponent } from './bot-message/bot-message-sentence';
import { BotMessageChoiceComponent } from './bot-message/bot-message-choice.component';
import { BotMessageLocationComponent } from './bot-message/bot-message-location';
import { BotMessageAttachmentComponent } from './bot-message/bot-message-attachment';
import { DateRangeCalendarComponent } from './date-range/date-range-calendar.component';
import { SharedModule } from '../shared-nlp/shared.module';
import { BotSharedService } from './bot-shared.service';
import { DisplayDialogComponent } from './bot-dialog/display-dialog.component';
import { MomentModule } from 'ngx-moment';
import { SelectBotComponent } from './select-bot/select-bot.component';

import {
  NbCalendarRangeModule,
  NbCardModule,
  NbIconModule,
  NbSelectModule,
  NbTooltipModule,
  NbPopoverModule,
  NbButtonModule,
  NbButtonGroupModule,
  NbAlertModule,
  NbAutocompleteModule
} from '@nebular/theme';
import { InfoButtonComponent } from './info-button/info-button.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

import { CanvasModule } from './canvas/canvas.module';
import {
  AutocompleteInputComponent,
  ChatUiComponent,
  ChatUiMessageComponent,
  ChoiceDialogComponent,
  ErrorHelperComponent,
  FileUploadComponent,
  FormControlComponent,
  JsonPreviewerComponent,
  NoBotConfigurationComponent,
  NoDataFoundComponent,
  PaginationComponent
} from './components';

import { AutofocusDirective, FullscreenDirective, MouseWheelListnerDirective } from './directives';

import { ChatUiMessageSentenceComponent } from './components/chat-ui/chat-ui-message/chat-ui-message-sentence/chat-ui-message-sentence.component';
import { ChatUiMessageSentenceElementComponent } from './components/chat-ui/chat-ui-message/chat-ui-message-sentence-element/chat-ui-message-sentence-element.component';
import { ChatUiMessageChoiceComponent } from './components/chat-ui/chat-ui-message/chat-ui-message-choice/chat-ui-message-choice.component';
import { ChatUiMessageAttachmentComponent } from './components/chat-ui/chat-ui-message/chat-ui-message-attachment/chat-ui-message-attachment.component';
import { ChatUiMessageLocationComponent } from './components/chat-ui/chat-ui-message/chat-ui-message-location/chat-ui-message-location';

import { ChatUiMessageSentenceComponent } from './components/chat-ui/chat-ui-message/chat-ui-message-sentence/chat-ui-message-sentence.component';
import { ChatUiMessageSentenceElementComponent } from './components/chat-ui/chat-ui-message/chat-ui-message-sentence-element/chat-ui-message-sentence-element.component';
import { ChatUiMessageChoiceComponent } from './components/chat-ui/chat-ui-message/chat-ui-message-choice/chat-ui-message-choice.component';
import { ChatUiMessageAttachmentComponent } from './components/chat-ui/chat-ui-message/chat-ui-message-attachment/chat-ui-message-attachment.component';
import { ChatUiMessageLocationComponent } from './components/chat-ui/chat-ui-message/chat-ui-message-location/chat-ui-message-location';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MomentModule,
    NbAlertModule,
    NbAutocompleteModule,
    NbCalendarRangeModule,
    NbCardModule,
    NbSelectModule,
    NbTooltipModule,
    NbIconModule,
    NbPopoverModule,
    NbButtonModule,
    NbButtonGroupModule,
    CanvasModule
  ],
  declarations: [
    AutocompleteInputComponent,
    BotMessageComponent,
    SentenceElementComponent,
    BotMessageSentenceComponent,
    BotMessageChoiceComponent,
    BotMessageLocationComponent,
    BotMessageAttachmentComponent,
    DisplayDialogComponent,
    SelectBotComponent,
    DateRangeCalendarComponent,
    InfoButtonComponent,
    ConfirmationDialogComponent,
    ErrorHelperComponent,
    PaginationComponent,
    NoDataFoundComponent,
    FormControlComponent,
    ChatUiComponent,
    ChatUiMessageComponent,
    ChatUiMessageSentenceComponent,
    ChoiceDialogComponent,
    JsonPreviewerComponent,
    FileUploadComponent,
    NoBotConfigurationComponent,
    AutofocusDirective,
    FullscreenDirective,
    MouseWheelListnerDirective,
    ChatUiMessageSentenceElementComponent,
    ChatUiMessageChoiceComponent,
    ChatUiMessageAttachmentComponent,
    ChatUiMessageLocationComponent
  ],
  exports: [
    AutocompleteInputComponent,
    BotMessageComponent,
    DisplayDialogComponent,
    SelectBotComponent,
    DateRangeCalendarComponent,
    InfoButtonComponent,
    ErrorHelperComponent,
    PaginationComponent,
    NoDataFoundComponent,
    FormControlComponent,
    ChatUiComponent,
    ChatUiMessageComponent,
    ChoiceDialogComponent,
    JsonPreviewerComponent,
    FileUploadComponent,
    NoBotConfigurationComponent,

    AutofocusDirective,
    FullscreenDirective,
    MouseWheelListnerDirective,

    CanvasModule
  ],
  providers: [BotSharedService],
  entryComponents: []
})
export class BotSharedModule {}
