import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ActionReport, BotMessage, DialogReport } from '../../../shared/model/dialog-data';
import { FlexibleConnectedPositionStrategyOrigin, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { RagMonitoringService } from '../rag-monitoring.service';
import { Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

interface SignalementForm {
  reason: FormControl<string>;
  comment: FormControl<string>
}

@Component({
  selector: 'tock-rag-monitoring-message',
  templateUrl: './rag-monitoring-message.component.html',
  styleUrls: ['./rag-monitoring-message.component.scss']
})
export class RagMonitoringMessageComponent implements OnInit {
  destroy = new Subject();
  
  @Input() dialog: DialogReport;
  @Input() action: ActionReport;
  @Input() message: BotMessage;
  @Input() isBot: boolean;

  @Output() onClearMessage = new EventEmitter<{dialog: DialogReport,message:BotMessage}>()

  overlayRef: OverlayRef | null;

  @ViewChild('signalementMenu') signalementMenu: TemplateRef<any>;

  constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef,private ragMonitoringService:RagMonitoringService) {
    this.ragMonitoringService.communication.pipe(takeUntil(this.destroy)).subscribe((evt) => {
      if (evt.type === 'documentClick') {
        this.hideSignalementMenu();
      }
    });
  }

  ngOnInit(): void {}

  form = new FormGroup<SignalementForm>({
    reason: new FormControl(undefined,[Validators.required]),
    comment: new FormControl(undefined),
  });

  get reason(): FormControl {
    return this.form.get('reason') as FormControl;
  }
  get comment(): FormControl {
    return this.form.get('comment') as FormControl;
  }

  get canSubmit(): boolean {
    return this.form.valid
  }
  
  validateAnswer() {
    this.message['_validated'] = true;
    this.onClearMessage.emit({dialog:this.dialog,message:this.message})
  }
  
  submitSignalAnswer() {
    this.message['_signaled'] = true;
    this.hideSignalementMenu()
    this.onClearMessage.emit({dialog:this.dialog,message:this.message})
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

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
