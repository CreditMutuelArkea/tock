import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ClassifiedEntity, EntityContainer, EntityWithSubEntities, Sentence } from '../../../../../model/nlp';
import { StateService } from '../../../../../core-nlp/state.service';
import { getContrastYIQ } from '../../../../utils';
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

  @Input() sentence: Sentence;
  @Input() prefix: string = 's';
  @Input() readOnly: boolean = false;

  @ViewChild('tokensContainer') tokensContainer: ElementRef;

  tokens: Token[];

  getContrastYIQ = getContrastYIQ;

  constructor(
    public state: StateService,
    private sentenceTrainingSentenceService: SentenceTrainingSentenceService,
    private cd: ChangeDetectorRef,
    private self: ElementRef
  ) {
    this.sentenceTrainingSentenceService.sentenceTrainingSentenceCommunication.pipe(takeUntil(this.destroy)).subscribe((evt) => {
      if (evt.type === 'refreshTokens') {
        this.rebuild();
      }

      if (evt.type === 'documentClick') {
        if (!self.nativeElement.contains(evt.event.target)) {
          this.selection = undefined;
          this.cd.detectChanges();
        }
      }
    });
  }

  ngOnInit(): void {
    this.rebuild();
  }

  private rebuild() {
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

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('token-selector')) return;

    event.stopPropagation();
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.startContainer !== range.endContainer || range.startOffset === range.endOffset) {
        selection.removeAllRanges();
        this.selection = undefined;
        return;
      }

      setTimeout(() => {
        this.sentenceTrainingSentenceService.documentClick(event);
      });

      const tokenTxt = range.startContainer.textContent;
      const selectedTxt = tokenTxt.substring(range.startOffset, range.endOffset);

      for (let i = 0; i < selectedTxt.length; i++) {
        if (!selectedTxt[i].trim().length) {
          const newrange = document.createRange();
          newrange.setStart(range.startContainer, range.startOffset + 1);
          newrange.setEnd(range.startContainer, range.endOffset);
          selection.removeAllRanges();
          selection.addRange(newrange);
          this.onMouseUp(event);
          return;
        } else break;
      }

      for (let i = selectedTxt.length - 1; i > 0; i--) {
        if (!selectedTxt[i].trim().length) {
          const newrange = document.createRange();
          newrange.setStart(range.startContainer, range.startOffset);
          newrange.setEnd(range.startContainer, range.endOffset - 1);
          selection.removeAllRanges();
          selection.addRange(newrange);
          this.onMouseUp(event);
          return;
        } else break;
      }

      const rangeOffset = this.getRangeOffset(range);

      this.selection = {
        start: rangeOffset,
        end: rangeOffset + (range.endOffset - range.startOffset)
      };
    }
  }

  selection: { start: number; end: number };

  getSelectionText() {
    return this.sentence.getText().substring(this.selection.start, this.selection.end);
  }

  getRangeOffset(range: Range): number {
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(this.tokensContainer.nativeElement);
    clonedRange.setEnd(range.startContainer, range.startOffset);
    return clonedRange.toString().length;
  }

  getEntities() {
    if (this.sentence instanceof Sentence) {
      const intent = this.state.currentApplication.intentById(this.sentence.classification.intentId);
      return intent?.entities ? intent.entities : [];
    } else {
      const sntce = this.sentence as EntityWithSubEntities;
      return sntce.entity.subEntities;
    }
  }

  assignEntity(entity, event?) {
    event?.stopPropagation();

    const parent = this.getParentEntity(this.sentence.classification.entities, this.selection.start, this.selection.end);

    if (!parent) {
      const newentity = new ClassifiedEntity(entity.entityTypeName, entity.role, this.selection.start, this.selection.end, []);
      this.sentence.addEntity(newentity);
    } else {
      const newentity = new ClassifiedEntity(entity.entityTypeName, entity.role, parent.start, parent.end, []);
      parent.entity.subEntities.push(newentity);
      parent.entity.subEntities.sort((e1, e2) => e1.start - e2.start);
    }

    this.selection = undefined;
    this.initTokens();
  }

  getParentEntity(entities: ClassifiedEntity[], start: number, end: number): { entity: ClassifiedEntity; start: number; end: number } {
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.start <= start && entity.end >= end) {
        return this.getParentSubentity(entity, start - entity.start, end - entity.start);
      }
    }

    return;
  }

  getParentSubentity(entity: ClassifiedEntity, start: number, end: number): { entity: ClassifiedEntity; start: number; end: number } {
    for (let i = 0; i < entity.subEntities.length; i++) {
      const subentity = entity.subEntities[i];
      if (subentity.start <= start && subentity.end >= end) {
        return this.getParentSubentity(subentity, start - subentity.start, end - subentity.start);
      }
    }

    return { entity, start, end };
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
