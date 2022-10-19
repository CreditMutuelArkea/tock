import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { StateService } from '../../../core-nlp/state.service';
import { PaginatedQuery } from '../../../model/commons';
import { SearchQuery } from '../../../model/nlp';
import { OffsetPosition } from '../../../shared/canvas/models';
import { ScenarioItem } from '../../models/scenario.model';

@Injectable({
  providedIn: 'root'
})
export class ScenarioConceptionService {
  public scenarioDesignerItemsCommunication = new Subject<any>();
  constructor(protected state: StateService) {}

  createSearchIntentsQuery(params: { searchString?: string; intentId?: string }): SearchQuery {
    const cursor: number = 0;
    const pageSize: number = 50;
    const mark = null;
    const paginatedQuery: PaginatedQuery = this.state.createPaginatedQuery(cursor, pageSize, mark);
    return new SearchQuery(
      paginatedQuery.namespace,
      paginatedQuery.applicationName,
      paginatedQuery.language,
      paginatedQuery.start,
      paginatedQuery.size,
      paginatedQuery.searchMark,
      params.searchString || null,
      params.intentId || null
    );
  }

  /*
    COMMUNICATION BETWEEN MAIN COMPONENT AND ITEMS COMPONENT
  */
  // Child components to designer communication
  addAnswer(item: ScenarioItem): void {
    this.scenarioDesignerItemsCommunication.next({
      type: 'addAnswer',
      item: item
    });
  }

  deleteAnswer(item: ScenarioItem, parentItemId: number): void {
    this.scenarioDesignerItemsCommunication.next({
      type: 'deleteAnswer',
      item: item,
      parentItemId: parentItemId
    });
  }

  itemDropped(targetId: number, droppedId: number): void {
    this.scenarioDesignerItemsCommunication.next({
      type: 'itemDropped',
      targetId: targetId,
      droppedId: droppedId
    });
  }

  selectItem(item: ScenarioItem): void {
    this.scenarioDesignerItemsCommunication.next({
      type: 'itemSelected',
      item: item
    });
  }

  testItem(item: ScenarioItem): void {
    this.scenarioDesignerItemsCommunication.next({
      type: 'testItem',
      item: item
    });
  }

  exposeItemPosition(item: ScenarioItem, position: OffsetPosition) {
    this.scenarioDesignerItemsCommunication.next({
      type: 'exposeItemPosition',
      item,
      position
    });
  }

  changeItemType(item, targetType) {
    this.scenarioDesignerItemsCommunication.next({
      type: 'changeItemType',
      item: item,
      targetType: targetType
    });
  }

  removeItemDefinition(item) {
    this.scenarioDesignerItemsCommunication.next({
      type: 'removeItemDefinition',
      item: item
    });
  }

  // Designer to child components communication
  focusItem(item: ScenarioItem): void {
    this.scenarioDesignerItemsCommunication.next({
      type: 'focusItem',
      item: item
    });
  }

  requireItemPosition(item: ScenarioItem): void {
    this.scenarioDesignerItemsCommunication.next({
      type: 'requireItemPosition',
      item: item
    });
  }
}