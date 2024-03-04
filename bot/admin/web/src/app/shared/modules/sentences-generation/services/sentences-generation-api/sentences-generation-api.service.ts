import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from '../../../../../core-nlp/rest/rest.service';
import { CompletionRequest, CompletionResponse } from '../../models';
import { StateService } from '../../../../../core-nlp/state.service';

@Injectable({
  providedIn: 'root'
})
export class SentencesGenerationApiService {
  constructor(private restService: RestService, private state: StateService) {}

  generateSentences(body: CompletionRequest): Observable<CompletionResponse> {
    const url = `/gen-ai/bot/${this.state.currentApplication.name}/sentence-generation`;
    //  /rest/admin/gen-ai/bot/cmb/sentence-generation

    return this.restService.post<CompletionRequest, CompletionResponse>(url, body);
  }
}
