import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  HostListener,
  OnDestroy,
  ElementRef,
  ViewContainerRef,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { Token } from '../models/token.model';
import { getContrastYIQ } from '../../../../../utils';
import { SentenceTrainingSentenceService } from '../sentence-training-sentence.service';
import { Subject, takeUntil } from 'rxjs';
import { ClassifiedEntity, Sentence } from '../../../../../../model/nlp';
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

  // @Output() displayTokenMenu = new EventEmitter<{ event: MouseEvent; token: Token }>();

  @ViewChild('userMenu') userMenu: TemplateRef<any>;

  getContrastYIQ = getContrastYIQ;

  constructor(
    public state: StateService,
    private self: ElementRef,
    private sentenceTrainingSentenceService: SentenceTrainingSentenceService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {
    this.sentenceTrainingSentenceService.sentenceTrainingSentenceCommunication.pipe(takeUntil(this.destroy)).subscribe((evt) => {
      if (evt.type === 'assignEntity') {
        if (this.txtSelectionStart >= 0 && this.txtSelectionEnd >= 0) {
          this.assignEntity(evt.entity);
        }
      }
    });
  }

  assignEntity(entity) {
    const newentity = new ClassifiedEntity(entity.entityTypeName, entity.role, this.txtSelectionStart, this.txtSelectionEnd, []);

    this.token.sentence.addEntity(newentity);

    this.sentenceTrainingSentenceService.refreshTokens();
  }

  delete(token: Token): void {
    if (token.entity) {
      token.sentence.removeEntity(token.entity);
      token.sentence.cleanupEditedSubEntities();

      this.sentenceTrainingSentenceService.refreshTokens();
    }
  }

  getEntities() {
    console.log(1);
    if (this.token.sentence instanceof Sentence) {
      const intent = this.state.currentApplication.intentById(this.token.sentence.classification.intentId);
      return intent.entities;
    } else {
      console.log(this.token.sentence);
    }

    return [];
  }

  displayMenu(args: { event: MouseEvent; token: Token }) {
    this.displayTokenMenu(args);
  }

  txtSelectionStart;
  txtSelectionEnd;

  @HostListener('mouseup', ['$event'])
  select(event?: MouseEvent) {
    event.stopPropagation();
    console.clear();

    if (event.target !== this.self.nativeElement && !this.self.nativeElement.contains(event.target)) {
      console.log(999);
      setTimeout(() => {
        this.txtSelectionStart = undefined;
        this.txtSelectionEnd = undefined;
      }, 100);
      return;
    }

    const windowsSelection = window.getSelection();

    if (windowsSelection.rangeCount > 0) {
      const selection = windowsSelection.getRangeAt(0);

      let start = selection.startOffset;
      let end = selection.endOffset;
      if (selection.startContainer !== selection.endContainer) {
        if (!selection.startContainer.childNodes[0]) {
          return;
        }
        end = selection.startContainer.childNodes[0].textContent.length - start;
      } else {
        if (start > end) {
          const tmp = start;
          start = end;
          end = tmp;
        }
      }
      if (start === end) {
        return;
      }

      const sentenceTxt = this.token.sentence.getText();
      const offset = sentenceTxt.indexOf(this.token.text);
      this.txtSelectionStart = start + offset;
      this.txtSelectionEnd = end + offset;

      setTimeout((_) => {
        this.displayTokenMenu({ event, token: null });
      });
    }
  }

  overlayRef: OverlayRef | null;

  @HostListener('document:click', ['$event'])
  private hideTokenMenu(): void {
    if (this.overlayRef) this.overlayRef.detach();
  }

  displayTokenMenu(args: { event: MouseEvent; token: Token }): void {
    args.event.stopPropagation();
    this.hideTokenMenu();

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(args.event.target as FlexibleConnectedPositionStrategyOrigin)
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

    this.overlayRef.attach(
      new TemplatePortal(this.userMenu, this.viewContainerRef, {
        $implicit: args.token
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
