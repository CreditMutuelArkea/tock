import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { RestService } from '../core-nlp/rest/rest.service';
import { StateService } from '../core-nlp/state.service';
import { TMPsources } from './mock-sources';
import { Source } from './models';

interface SourcesManagementState {
  sources: Source[];
}

const SourcesManagementInitialState: SourcesManagementState = {
  sources: TMPsources
};

@Injectable({
  providedIn: 'root'
})
export class SourceManagementService {
  private _state: BehaviorSubject<SourcesManagementState>;
  state$: Observable<SourcesManagementState>;

  constructor(private rest: RestService, private stateService: StateService) {
    this._state = new BehaviorSubject(SourcesManagementInitialState);
    this.state$ = this._state.asObservable();
  }

  private getState(): SourcesManagementState {
    return this._state.getValue();
  }

  private setState(state: SourcesManagementState): void {
    return this._state.next(state);
  }

  getSources() {
    const state = this.state$;
    const notLoaded = state.pipe(map((state) => state.sources));
    // const loaded = state.pipe(
    //   filter((state) => state.loaded === true),
    //   map((state) => state.scenariosGroups)
    // );

    // return merge(notLoaded, loaded);
    return notLoaded;
  }

  getSource(sourceId: string) {
    return this.getSources().pipe(
      switchMap(() => this.state$),
      map((data) => data.sources.find((s) => s.id === sourceId))
    );
  }

  sendPocSource(selection) {
    const payload = selection.map((sel, index) => {
      return {
        page_content: sel.answer,
        metadata: {
          source: sel.sourceRef,
          row: index
        }
      };
    });
    console.log(payload);
    // /import-data-csv?source_name=application._id
    // const params = new HttpParams().set('source_name', this.stateService.currentApplication._id)

    return this.rest.post(`/import-data-csv`, payload);
  }
}
