import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
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
import { Token } from './models/token.model';
import { SentenceTrainingSentenceService } from './sentence-training-sentence.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'tock-sentence-training-sentence',
  templateUrl: './sentence-training-sentence.component.html',
  styleUrls: ['./sentence-training-sentence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SentenceTrainingSentenceComponent implements OnInit, OnDestroy {
  destroy = new Subject();

  @Input() sentence: EntityContainer;
  @Input() prefix: string = 's';
  @Input() readOnly: boolean = false;

  tokens: Token[];
  // entityProvider: EntityProvider;

  getContrastYIQ = getContrastYIQ;

  constructor(
    public state: StateService,
    private sentenceTrainingSentenceService: SentenceTrainingSentenceService,
    private cd: ChangeDetectorRef
  ) {
    this.sentenceTrainingSentenceService.sentenceTrainingSentenceCommunication.pipe(takeUntil(this.destroy)).subscribe((evt) => {
      if (evt.type === 'refreshTokens') {
        this.rebuild();
      }
    });
  }

  ngOnInit(): void {
    // if (this.sentence instanceof Sentence) {
    //   this.entityProvider = new IntentEntityProvider(this.nlp, this.state, this.sentence as Sentence);
    // } else {
    //   this.entityProvider = new SubEntityProvider(this.nlp, this.state, this.sentence as EntityWithSubEntities);
    // }

    this.rebuild();
  }

  private rebuild() {
    // if (this.entityProvider) {
    //   this.entityProvider.reload();
    // }
    this.initTokens();
  }

  initTokens(): void {
    this.tokens = this.parseTokens(this.sentence);
    this.cd.detectChanges();
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

  @HostListener('document:click', ['$event'])
  documentClick() {
    this.sentenceTrainingSentenceService.documentClick();
  }

  @HostListener('mouseup', ['$event'])
  componentMouseUp(event: MouseEvent) {
    this.sentenceTrainingSentenceService.componentMouseUp(event);
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
