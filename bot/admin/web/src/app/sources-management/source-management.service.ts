import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { RestService } from '../core-nlp/rest/rest.service';
import { StateService } from '../core-nlp/state.service';
import { IndexingSessionStatus, Source, SourceTypes } from './models';

const TMPsources: Source[] = [
  {
    id: '1234567879',
    enabled: true,
    name: 'CMB Faqs',
    description: '',
    source_type: SourceTypes.file,
    source_parameters: {
      file_format: 'csv'
    },
    current_indexing_session_id: '987654',
    indexing_sessions: [
      {
        id: '987654',
        job_id: '778899',
        start_date: new Date('2023-07-24T12:06:11.106Z'),
        end_date: new Date('2023-07-24T14:22:07.106Z'),
        embeding_engine: 'text-embedding-ada-002',
        status: IndexingSessionStatus.complete
      },
      {
        id: '4654654',
        job_id: '',
        start_date: new Date('2023-07-21T12:06:11.106Z'),
        end_date: new Date('2023-07-21T12:06:11.106Z'),
        embeding_engine: 'text-embedding-ada-002',
        status: IndexingSessionStatus.complete
      }
    ]
  },
  {
    id: '555654654',
    name: 'Faqs CMSO',
    enabled: true,
    description: 'Faqs en ligne CMSO',
    source_type: SourceTypes.remote,
    source_parameters: {
      source_url: new URL('https://www.cmso.com/reseau-bancaire-cooperatif/web/aide/faq'),
      exclusion_urls: [
        new URL('https://www.arkea.com/banque/assurance/credit/accueil'),
        new URL('https://www.cmso.com/reseau-bancaire-cooperatif/web/communiques-de-presse-1')
      ],
      xpaths: ['//*[@id="st-faq-root"]/section/div/div[2]'],
      periodic_update: true,
      periodic_update_frequency: 30
    },
    current_indexing_session_id: undefined,
    indexing_sessions: [
      {
        id: '321321',
        job_id: '778899',
        start_date: new Date('2023-07-24T12:06:11.106Z'),
        end_date: new Date('2023-07-24T14:22:07.106Z'),
        embeding_engine: 'text-embedding-ada-002',
        status: IndexingSessionStatus.running
      }
    ]
  },
  {
    id: '987654321',
    enabled: true,
    name: 'ArkInfo',
    description: '',
    source_type: SourceTypes.file,
    source_parameters: {
      file_format: 'json'
    }
  },
  {
    id: '654',
    enabled: false,
    name: 'Other kind of json source format',
    description: '',
    source_type: SourceTypes.file,

    source_parameters: {
      file_format: 'json'
    }
  }
];

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
