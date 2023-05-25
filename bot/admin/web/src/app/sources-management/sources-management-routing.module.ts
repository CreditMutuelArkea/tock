import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationResolver } from '../core-nlp/application.resolver';
import { AuthGuard } from '../core-nlp/auth/auth.guard';
import { BoardComponent } from './board/board.component';
import { FaqsGenerationComponent } from './faqs-generation/faqs-generation.component';
import { QuestionsGenerationComponent } from './questions-generation/questions-generation.component';
import { SourcesProcessingComponent } from './sources-processing/sources-processing.component';

const routes: Routes = [
  {
    path: 'board',
    component: BoardComponent,
    canActivate: [AuthGuard],
    resolve: {
      application: ApplicationResolver
    }
  },
  {
    path: 'processing',
    component: SourcesProcessingComponent,
    canActivate: [AuthGuard],
    resolve: {
      application: ApplicationResolver
    }
  },
  {
    path: 'questions-generation',
    component: QuestionsGenerationComponent,
    canActivate: [AuthGuard],
    resolve: {
      application: ApplicationResolver
    }
  },
  {
    path: 'faqs-generation',
    component: FaqsGenerationComponent,
    canActivate: [AuthGuard],
    resolve: {
      application: ApplicationResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class SourcesManagementRoutingModule {}
