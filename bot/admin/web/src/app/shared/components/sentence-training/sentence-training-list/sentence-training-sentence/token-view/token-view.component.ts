import { Component, Input, OnDestroy, ElementRef, ViewContainerRef, ViewChild, TemplateRef } from '@angular/core';
import { Token } from '../models/token.model';
import { getContrastYIQ } from '../../../../../utils';
import { SentenceTrainingSentenceService } from '../sentence-training-sentence.service';
import { Subject, takeUntil } from 'rxjs';
import { FlexibleConnectedPositionStrategyOrigin, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { StateService } from '../../../../../../core-nlp/state.service';

@Component({
  selector: 'tock-token-view',
  templateUrl: './token-view.component.html',
  styleUrls: ['./token-view.component.scss']
})
export class TokenViewComponent implements OnDestroy {
  destroy = new Subject();

  @Input() token: Token;

  @ViewChild('userMenu') userMenu: TemplateRef<any>;

  getContrastYIQ = getContrastYIQ;

  constructor(
    public state: StateService,
    private sentenceTrainingSentenceService: SentenceTrainingSentenceService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {
    this.sentenceTrainingSentenceService.sentenceTrainingSentenceCommunication.pipe(takeUntil(this.destroy)).subscribe((evt) => {
      if (evt.type === 'documentClick') {
        this.hideTokenMenu();
      }
    });
  }

  delete(token: Token): void {
    if (token.entity) {
      token.sentence.removeEntity(token.entity);
      token.sentence.cleanupEditedSubEntities();

      this.sentenceTrainingSentenceService.refreshTokens();
    }
  }

  overlayRef: OverlayRef | null;

  onClick(event) {
    if (this.token.entity) this.displayMenu(event);
  }

  displayMenu(event: MouseEvent) {
    this.sentenceTrainingSentenceService.documentClick(event);
    this.displayTokenMenu(event);
  }

  hideTokenMenu(): void {
    if (this.overlayRef) this.overlayRef.detach();
  }

  displayTokenMenu(event: MouseEvent): void {
    event.stopPropagation();

    this.hideTokenMenu();

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

    this.overlayRef.attach(new TemplatePortal(this.userMenu, this.viewContainerRef));
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
