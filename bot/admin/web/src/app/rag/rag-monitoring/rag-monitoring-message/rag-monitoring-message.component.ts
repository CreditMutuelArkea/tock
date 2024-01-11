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

import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ActionReport, BotMessage, DialogReport, Sentence } from '../../../shared/model/dialog-data';
import { FlexibleConnectedPositionStrategyOrigin, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { RagMonitoringService } from '../rag-monitoring.service';
import { Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface SignalementForm {
  reason: FormControl<string>;
  comment: FormControl<string>;
}

@Component({
  selector: 'tock-rag-monitoring-message',
  templateUrl: './rag-monitoring-message.component.html',
  styleUrls: ['./rag-monitoring-message.component.scss']
})
export class RagMonitoringMessageComponent {
  destroy = new Subject();

  @Input() dialog: DialogReport;
  @Input() action: ActionReport;
  @Input() message: BotMessage;
  @Input() isBot: boolean;

  @Output() onClearMessage = new EventEmitter<{ dialog: DialogReport; message: BotMessage }>();

  overlayRef: OverlayRef | null;

  @ViewChild('signalementMenu') signalementMenu: TemplateRef<any>;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private ragMonitoringService: RagMonitoringService,
    private router: Router
  ) {
    this.ragMonitoringService.communication.pipe(takeUntil(this.destroy)).subscribe((evt) => {
      if (evt.type === 'documentClick') {
        this.hideSignalementMenu();
      }
    });
  }

  form = new FormGroup<SignalementForm>({
    reason: new FormControl(undefined, [Validators.required]),
    comment: new FormControl(undefined)
  });

  get reason(): FormControl {
    return this.form.get('reason') as FormControl;
  }
  get comment(): FormControl {
    return this.form.get('comment') as FormControl;
  }

  get canSubmit(): boolean {
    return this.form.valid;
  }

  validateAnswer(): void {
    this.message['_validated'] = true;
    this.onClearMessage.emit({ dialog: this.dialog, message: this.message });
  }

  submitSignalAnswer(): void {
    this.message['_signaled'] = true;
    this.hideSignalementMenu();
    this.onClearMessage.emit({ dialog: this.dialog, message: this.message });
  }

  hideSignalementMenu(): void {
    if (this.overlayRef) this.overlayRef.detach();
  }

  signalAnswer(event: MouseEvent, message: BotMessage): void {
    event.stopPropagation();

    this.ragMonitoringService.documentClick(event);

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(event.target as FlexibleConnectedPositionStrategyOrigin)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        },
        {
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center'
        },
        {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center'
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    this.overlayRef.attach(new TemplatePortal(this.signalementMenu, this.viewContainerRef));
  }

  createFaq(message: Sentence): void {
    const currentActionIndex = this.dialog.actions.findIndex((action) => action === this.action);
    let question;

    for (let index = currentActionIndex - 1; index >= 0; index--) {
      const action = this.dialog.actions[index];

      if (!action.isBot()) {
        question = this.extractMessageText(action.message as Sentence);
        index = -1;
      }
    }

    let answer = this.extractMessageText(message);

    this.router.navigate(['faq/management'], { state: { question, answer } });
  }

  extractMessageText(message: Sentence): string {
    let textsArray = [];
    if (message.text) {
      textsArray.push(message.text);
    }

    if (message.messages?.length) {
      message.messages.forEach((mssg) => {
        mssg.texts.forEach((txt) => {
          textsArray.push(txt);
        });
      });
    }
    if (textsArray.length) return textsArray.join('\n');
    return;
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
