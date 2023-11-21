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
import { ClassifiedEntity, EntityDefinition, EntityWithSubEntities, Sentence } from '../../../../../../model/nlp';
import { FlexibleConnectedPositionStrategyOrigin, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { StateService } from '../../../../../../core-nlp/state.service';
import { NbDialogService } from '@nebular/theme';
import { EntityCreationComponent } from '../../../entity-creation/entity-creation.component';
import { NlpService } from '../../../../../../nlp-tabs/nlp.service';

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
    private self: ElementRef,
    private sentenceTrainingSentenceService: SentenceTrainingSentenceService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private nbDialogService: NbDialogService,
    private nlp: NlpService
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
    const text = this.token.sentence.getText();
    for (let i = this.txtSelectionEnd - 1; i >= this.txtSelectionStart; i--) {
      if (text[i].trim().length === 0) {
        this.txtSelectionEnd--;
      } else {
        break;
      }
    }
    for (let i = this.txtSelectionStart; i < this.txtSelectionEnd; i++) {
      if (text[i].trim().length === 0) {
        this.txtSelectionStart++;
      } else {
        break;
      }
    }

    let start = this.txtSelectionStart;
    let end = this.txtSelectionEnd;
    if (!this.token.entity) {
      start += this.txtSelectionOffset;
      end += this.txtSelectionOffset;
    }

    const newentity = new ClassifiedEntity(entity.entityTypeName, entity.role, start, end, []);

    if (!this.token.entity) {
      start += this.txtSelectionOffset;
      end += this.txtSelectionOffset;
      this.token.sentence.addEntity(newentity);
    } else {
      this.token.entity.subEntities.push(newentity);
      this.token.entity.subEntities.sort((e1, e2) => e1.start - e2.start);
    }

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
    if (this.token.sentence instanceof Sentence) {
      const intent = this.state.currentApplication.intentById(this.token.sentence.classification.intentId);
      return intent.entities;
    } else {
      const sntce = this.token.sentence as EntityWithSubEntities;
      return sntce.entity.subEntities;
    }
  }

  newEntity() {
    const dialogRef = this.nbDialogService.open(EntityCreationComponent, {
      context: {
        entityProvider: this.token.entityProvider
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result && result !== 'cancel') {
        const name = result.name;
        const role = result.role;
        const existingEntityType = this.state.findEntityTypeByName(name);

        if (existingEntityType) {
          const entity = new EntityDefinition(name, role);
          const result = this.token.entityProvider.addEntity(entity);

          this.assignEntity(entity);
          if (result) {
            // this.toastrService.success(result);
            console.log(result);
          }
        } else {
          this.nlp.createEntityType(name).subscribe((e) => {
            if (e) {
              const entity = new EntityDefinition(e.name, role);
              const entities = this.state.entityTypes.getValue().slice(0);
              entities.push(e);
              this.state.entityTypes.next(entities);
              const result = this.token.entityProvider.addEntity(entity);
              this.assignEntity(entity);
              if (result) {
                // this.toastrService.success(result);
                console.log('this.toastrService.success(result)');
                console.log(result);
              }
            } else {
              // this.toastrService.success(`Error when creating Entity Type ${name}`);
              console.log('this.toastrService.success(`Error when creating Entity Type ${name}`)');
            }
          });
        }
      }
    });
  }

  displayMenu(event: MouseEvent) {
    this.displayTokenMenu(event, 'delete');
  }

  txtSelectionOffset;
  txtSelectionStart;
  txtSelectionEnd;

  @HostListener('mouseup', ['$event'])
  select(event?: MouseEvent) {
    event.stopPropagation();

    if (event.target !== this.self.nativeElement && !this.self.nativeElement.contains(event.target)) {
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
      this.txtSelectionOffset = offset;
      this.txtSelectionStart = start;
      this.txtSelectionEnd = end;

      setTimeout((_) => {
        this.displayTokenMenu(event, 'select');
      });
    }
  }

  overlayRef: OverlayRef | null;

  @HostListener('document:click', ['$event'])
  private hideTokenMenu(): void {
    if (this.overlayRef) this.overlayRef.detach();
  }

  displayTokenMenu(event: MouseEvent, action: 'delete' | 'select'): void {
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

    this.overlayRef.attach(new TemplatePortal(this.userMenu, this.viewContainerRef, { $implicit: action }));
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
