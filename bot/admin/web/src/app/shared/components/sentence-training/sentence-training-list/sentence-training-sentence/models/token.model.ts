import { User } from '../../../../../../model/auth';
import { ClassifiedEntity, EntityContainer, Sentence } from '../../../../../../model/nlp';
import { EntityProvider } from '../sentence-training-sentence.component';

export class Token {
  public end: number;

  constructor(
    public start: number,
    public text: string,
    public sentence: EntityContainer,
    public entityProvider: EntityProvider,
    public entity?: ClassifiedEntity,
    public subTokens?: Token[]
  ) {
    this.end = this.start + text.length;
  }

  display(sentence: Sentence, user: User): string {
    if (!this.entity) {
      return '';
    } else {
      return this.entity.qualifiedName(user) + ' = ' + sentence.entityValue(this.entity);
    }
  }

  color(): string {
    if (this.entity) {
      return this.entity.entityColor;
    } else {
      return '';
    }
  }
}
