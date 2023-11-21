import { Component, HostListener, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
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
import { SentenceTrainingSentenceService } from './sentence-training-sentence.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'tock-sentence-training-sentence',
  templateUrl: './sentence-training-sentence.component.html',
  styleUrls: ['./sentence-training-sentence.component.scss']
})
export class SentenceTrainingSentenceComponent implements OnInit, OnDestroy {
  destroy = new Subject();

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
    private viewContainerRef: ViewContainerRef,
    private sentenceTrainingSentenceService: SentenceTrainingSentenceService
  ) {
    this.sentenceTrainingSentenceService.sentenceTrainingSentenceCommunication.pipe(takeUntil(this.destroy)).subscribe((evt) => {
      if (evt.type === 'refreshTokens') {
        this.rebuild();
      }
    });
  }

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
          result.push(new Token(i, text.substring(i, entity.start), sentence, this.entityProvider));
        }

        const token = new Token(entity.start, text.substring(entity.start, entity.end), sentence, this.entityProvider, entity);
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
          result.push(new Token(i, text.substring(i, text.length), sentence, this.entityProvider));
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

  // onSelect(entity: EntityDefinition) {
  //   this.sentenceTrainingSentenceService.assignEntity(entity);
  // }

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
    // this.onSelect(entity);
    this.toastrService.success(`Entity Type ${entity.qualifiedRole} added`, 'Entity added');
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

  addEntity(entity: EntityDefinition, highlight?: SentenceTrainingSentenceComponent): string;
}

export class IntentEntityProvider implements EntityProvider {
  constructor(private nlp: NlpService, private state: StateService, private sentence: Sentence, private intent?: Intent) {}

  addEntity(entity: EntityDefinition, highlight?: SentenceTrainingSentenceComponent): string {
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

  addEntity(entity: EntityDefinition, highlight?: SentenceTrainingSentenceComponent): string {
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
