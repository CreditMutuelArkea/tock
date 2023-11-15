import { Component, HostListener, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import {
  ClassifiedEntity,
  EntityContainer,
  EntityDefinition,
  EntityType,
  EntityWithSubEntities,
  Intent,
  Sentence
} from '../../../../../model/nlp';
import { NlpService } from '../../../../../nlp-tabs/nlp.service';
import { StateService } from '../../../../../core-nlp/state.service';
import { getContrastYIQ } from '../../../../utils';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { isNullOrUndefined } from '../../../../../model/commons';
import { EntityCreationComponent } from '../../entity-creation/entity-creation.component';
import { FlexibleConnectedPositionStrategyOrigin, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Token } from './models/token.model';

@Component({
  selector: 'tock-sentence-training-sentence',
  templateUrl: './sentence-training-sentence.component.html',
  styleUrls: ['./sentence-training-sentence.component.scss']
})
export class SentenceTrainingSentenceComponent implements OnInit {
  @Input() sentence: EntityContainer;
  @Input() prefix: string = 's';
  @Input() readOnly: boolean = false;

  tokens: Token[];
  entityProvider: EntityProvider;

  getContrastYIQ = getContrastYIQ;

  constructor(
    private nlp: NlpService,
    public state: StateService,
    private nbDialogService: NbDialogService,
    private toastrService: NbToastrService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    if (this.sentence instanceof Sentence) {
      this.entityProvider = new IntentEntityProvider(this.nlp, this.state, this.sentence as Sentence);
    } else {
      this.entityProvider = new SubEntityProvider(this.nlp, this.state, this.sentence as EntityWithSubEntities);
    }

    this.rebuild();
  }

  private rebuild() {
    if (this.entityProvider) {
      this.entityProvider.reload();
    }
    this.initTokens();
  }

  initTokens(): void {
    this.tokens = this.parseTokens(this.sentence);
  }

  parseTokens(sentence: EntityContainer) {
    let text: String = sentence.getText();
    let entities: ClassifiedEntity[] = sentence.getEntities();

    let i = 0;
    let entityIndex = 0;
    const result: Token[] = [];

    while (i <= text.length) {
      if (entities.length > entityIndex) {
        const entity = entities[entityIndex] as ClassifiedEntity;
        if (entity.start !== i) {
          result.push(new Token(i, text.substring(i, entity.start), sentence));
        }

        const token = new Token(entity.start, text.substring(entity.start, entity.end), sentence, entity);
        if (token.entity?.subEntities?.length) {
          token.subTokens = this.parseTokens(
            new EntityWithSubEntities(sentence.getText().substring(token.start, token.end), token.entity, token.entity)
          );
        }
        result.push(token);

        i = entity.end;
        entityIndex++;
      } else {
        if (i != text.length) {
          result.push(new Token(i, text.substring(i, text.length), sentence));
        }
        break;
      }
    }

    return result;
  }

  delete(token: Token): void {
    if (token.entity) {
      token.sentence.removeEntity(token.entity);
      token.sentence.cleanupEditedSubEntities();

      this.rebuild();
    }
  }

  // @HostListener('mouseup', ['$event'])
  select(event?: MouseEvent) {
    this.hideTokenMenu();
    setTimeout((_) => {
      const windowsSelection = window.getSelection();
      console.log(windowsSelection);
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
        const span = selection.startContainer.parentElement;
        console.log(start, end);
        this.txtSelectionStart = -1;
        this.txtSelectionEnd = -1;

        this.findSelected(span.parentNode, new SelectedResult(span, start, end));

        // const overlap = this.sentence.overlappedEntity(this.txtSelectionStart, this.txtSelectionEnd);
        // if (overlap) {
        //   if (this.state.currentApplication.supportSubEntities) {
        //     this.sentence
        //       .addEditedSubEntities(overlap)
        //       .setSelection(this.txtSelectionStart - overlap.start, this.txtSelectionEnd - overlap.start);
        //   }
        //   window.getSelection().removeAllRanges();
        // } else if (this.entityProvider.isValid()) {
        //   this.displayTokenMenu({ event, token: null });
        // }
        this.displayTokenMenu({ event, token: null });
      }
    });
  }

  txtSelectionStart: number;
  txtSelectionEnd: number;

  private findSelected(node: Node, result: SelectedResult): void {
    if (this.txtSelectionStart == -1) {
      if (node.nodeType === Node.TEXT_NODE) {
        const content = node.textContent;
        result.alreadyCount += content.length;
      } else {
        node.childNodes.forEach((child) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node === result.selectedNode) {
              this.txtSelectionStart = result.alreadyCount + result.startOffset;
              this.txtSelectionEnd = this.txtSelectionStart + result.endOffset - result.startOffset;
              console.log(this.txtSelectionStart, this.txtSelectionEnd);
            } else {
              this.findSelected(child, result);
            }
          }
        });
      }
    }
  }

  onSelect(entity: EntityDefinition) {
    if (this.txtSelectionStart < this.txtSelectionEnd) {
      const text = this.sentence.getText();
      if (this.txtSelectionStart >= 0 && this.txtSelectionEnd <= text.length) {
        //trim spaces
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
        if (this.txtSelectionStart < this.txtSelectionEnd) {
          const e = new ClassifiedEntity(entity.entityTypeName, entity.role, this.txtSelectionStart, this.txtSelectionEnd, []);
          this.sentence.addEntity(e);
        }
        this.initTokens();
      }
    }
  }

  addEntity() {
    const dialogRef = this.nbDialogService.open(EntityCreationComponent, {
      context: {
        entityProvider: this.entityProvider
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result && result !== 'cancel') {
        const name = result.name;
        const role = result.role;
        const existingEntityType = this.state.findEntityTypeByName(name);
        if (existingEntityType) {
          const entity = new EntityDefinition(name, role);
          const result = this.entityProvider.addEntity(entity, this);
          if (result) {
            this.toastrService.success(result);
          }
        } else {
          this.nlp.createEntityType(name).subscribe((e) => {
            if (e) {
              const entity = new EntityDefinition(e.name, role);
              const entities = this.state.entityTypes.getValue().slice(0);
              entities.push(e);
              this.state.entityTypes.next(entities);
              const result = this.entityProvider.addEntity(entity, this);
              if (result) {
                this.toastrService.success(result);
              }
            } else {
              this.toastrService.success(`Error when creating Entity Type ${name}`);
            }
          });
        }
      }
    });
  }

  notifyAddEntity(entity: EntityDefinition) {
    this.onSelect(entity);
    this.toastrService.success(`Entity Type ${entity.qualifiedRole} added`, 'Entity added');
  }

  overlayRef: OverlayRef | null;
  @ViewChild('userMenu') userMenu: TemplateRef<any>;

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
}

export class SelectedResult {
  alreadyCount: number;

  constructor(public selectedNode: any, public startOffset: number, public endOffset) {
    this.alreadyCount = 0;
  }
}

export interface EntityProvider {
  reload();

  getEntities(): EntityDefinition[];

  isValid(): boolean;

  hasEntityRole(role: string): boolean;

  addEntity(entity: EntityDefinition, highlight: SentenceTrainingSentenceComponent): string;
}

export class IntentEntityProvider implements EntityProvider {
  constructor(private nlp: NlpService, private state: StateService, private sentence: Sentence, private intent?: Intent) {}

  addEntity(entity: EntityDefinition, highlight: SentenceTrainingSentenceComponent): string {
    this.intent.addEntity(entity);
    const allEntities = this.state.entities.getValue();
    if (!allEntities.some((e) => e.entityTypeName === entity.entityTypeName && e.role === entity.role)) {
      this.state.entities.next(this.state.currentApplication.allEntities());
    }
    this.nlp.saveIntent(this.intent).subscribe((_) => {
      highlight.notifyAddEntity(entity);
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

  addEntity(entity: EntityDefinition, highlight: SentenceTrainingSentenceComponent): string {
    if (
      this.entity.root.containsEntityType(entity.entityTypeName) ||
      this.containsEntityType(this.state.findEntityTypeByName(entity.entityTypeName), this.entity.root.type, new Set())
    ) {
      return 'adding recursive sub entity is not allowed';
    }
    this.entityType.addEntity(entity);
    this.nlp.updateEntityType(this.entityType).subscribe((_) => {
      highlight.notifyAddEntity(entity);
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
