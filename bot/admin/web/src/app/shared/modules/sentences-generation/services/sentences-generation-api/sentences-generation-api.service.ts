import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from '../../../../../core-nlp/rest/rest.service';
import { CompletionRequest, CompletionResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class SentencesGenerationApiService {
  constructor(private restService: RestService) {}

  generateSentences(body: CompletionRequest): Observable<CompletionResponse> {
    return this.restService.post<CompletionRequest, CompletionResponse>('/openai/generate-sentences', body);
  }
}
