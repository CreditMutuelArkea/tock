import { Component, Input, OnDestroy, ElementRef, ViewContainerRef, ViewChild, TemplateRef } from '@angular/core';
import { Token } from '../models/token.model';
import { getContrastYIQ } from '../../../../../utils';
import { SentenceTrainingSentenceService } from '../sentence-training-sentence.service';
import { Subject, takeUntil } from 'rxjs';
import { ClassifiedEntity, EntityDefinition, EntityType, EntityWithSubEntities, Intent, Sentence } from '../../../../../../model/nlp';
import { FlexibleConnectedPositionStrategyOrigin, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { StateService } from '../../../../../../core-nlp/state.service';
import { NbDialogService } from '@nebular/theme';
import { EntityCreationComponent } from '../../../entity-creation/entity-creation.component';
import { NlpService } from '../../../../../../nlp-tabs/nlp.service';
import { isNullOrUndefined } from '../../../../../../model/commons';

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
      if (evt.type === 'documentClick') {
        this.hideTokenMenu();
      }

      if (evt.type === 'componentMouseUp') {
        this.select(evt.event);
      }

      if (evt.type === 'assignEntity') {
        if (this.txtSelectionStart >= 0 && this.txtSelectionEnd >= 0) {
          this.assignEntity(evt.entity);
        }
      }
    });
  }

  assignEntity(entity) {
    console.log(entity);
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
    console.log(entity);
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
      return intent?.entities ? intent.entities : [];
    } else {
      const sntce = this.token.sentence as EntityWithSubEntities;
      return sntce.entity.subEntities;
    }
  }

  createEntityProvider() {
    if (this.token.sentence instanceof Sentence) {
      const provider = new IntentEntityProvider(this.nlp, this.state, this.token.sentence as Sentence);
      provider.reload();
      return provider;
    } else {
      const provider = new SubEntityProvider(this.nlp, this.state, this.token.sentence as EntityWithSubEntities);
      provider.reload();
      return provider;
    }
  }

  newEntity() {
    const dialogRef = this.nbDialogService.open(EntityCreationComponent, {
      context: {
        entityProvider: this.createEntityProvider()
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result && result !== 'cancel') {
        const name = result.name;
        const role = result.role;
        const existingEntityType = this.state.findEntityTypeByName(name);

        if (existingEntityType) {
          const entity = new EntityDefinition(name, role);
          const result = this.createEntityProvider().addEntity(entity);

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
              const result = this.createEntityProvider().addEntity(entity);
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

  overlayRef: OverlayRef | null;

  private hideTokenMenu(): void {
    if (this.overlayRef) this.overlayRef.detach();
  }

  txtSelectionOffset;
  txtSelectionStart;
  txtSelectionEnd;

  // @HostListener('mouseup', ['$event'])
  select(event?: MouseEvent) {
    event.stopPropagation();

    if (this.txtSelectionStart || (event.target !== this.self.nativeElement && !this.self.nativeElement.contains(event.target))) {
      setTimeout(() => {
        this.txtSelectionStart = undefined;
        this.txtSelectionEnd = undefined;
      }, 100);

      return;
    }

    const intentId = this.token.sentence['classification']?.intentId;
    if (['tock:unknown', 'tock:ragexcluded'].includes(intentId)) {
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

export interface EntityProvider {
  reload();

  getEntities(): EntityDefinition[];

  isValid(): boolean;

  hasEntityRole(role: string): boolean;

  addEntity(entity: EntityDefinition): string;
}

export class IntentEntityProvider implements EntityProvider {
  constructor(private nlp: NlpService, private state: StateService, private sentence: Sentence, private intent?: Intent) {}

  addEntity(entity: EntityDefinition): string {
    this.intent.addEntity(entity);
    const allEntities = this.state.entities.getValue();
    if (!allEntities.some((e) => e.entityTypeName === entity.entityTypeName && e.role === entity.role)) {
      this.state.entities.next(this.state.currentApplication.allEntities());
    }
    this.nlp.saveIntent(this.intent).subscribe((_) => {
      // highlight.notifyAddEntity(entity);
      console.log('highlight.notifyAddEntity(entity)');
    });
    return null;
  }

  hasEntityRole(role: string): boolean {
    return this.intent.containsEntityRole(role);
  }

  isValid(): boolean {
    return this.intent && !this.intent.isUnknownIntent();
  }

  reload() {
    if (this.sentence && this.sentence.classification) {
      this.intent = this.state.currentApplication.intentById(this.sentence.classification.intentId);
      console.log(this.intent);
    }
  }

  getEntities(): EntityDefinition[] {
    if (this.intent) {
      return this.intent.entities;
    } else {
      return [];
    }
  }
}

export class SubEntityProvider implements EntityProvider {
  constructor(
    private nlp: NlpService,
    private state: StateService,
    private entity: EntityWithSubEntities,
    private entityType?: EntityType
  ) {}

  addEntity(entity: EntityDefinition): string {
    if (
      this.entity.root.containsEntityType(entity.entityTypeName) ||
      this.containsEntityType(this.state.findEntityTypeByName(entity.entityTypeName), this.entity.root.type, new Set())
    ) {
      return 'adding recursive sub entity is not allowed';
    }
    this.entityType.addEntity(entity);
    this.nlp.updateEntityType(this.entityType).subscribe((_) => {
      // highlight.notifyAddEntity(entity);
      console.log('highlight.notifyAddEntity(entity)');
    });
    return null;
  }

  private containsEntityType(entityType: EntityType, entityTypeName: string, entityTypes: Set<string>): boolean {
    if (entityTypeName === entityType.name) {
      return true;
    }
    entityTypes.add(entityType.name);
    return (
      entityType.subEntities
        .filter((e) => !entityTypes.has(e.entityTypeName))
        .find((e) => this.containsEntityType(this.state.findEntityTypeByName(e.entityTypeName), entityTypeName, entityTypes)) !== undefined
    );
  }

  hasEntityRole(role: string): boolean {
    return this.entityType.containsEntityRole(role);
  }

  isValid(): boolean {
    return !isNullOrUndefined(this.entityType);
  }

  reload() {
    if (this.entity) {
      this.entityType = this.state.findEntityTypeByName(this.entity.type);
    }
  }

  getEntities(): EntityDefinition[] {
    if (this.entityType) {
      return this.entityType.subEntities;
    } else {
      return [];
    }
  }
}
