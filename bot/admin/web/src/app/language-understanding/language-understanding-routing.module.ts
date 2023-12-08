import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core-nlp/auth/auth.guard';
import { ApplicationResolver } from '../core-nlp/application.resolver';
import { TryComponent } from '../try/try.component';
import { IntentsComponent } from '../intents/intents.component';
import { EntitiesComponent } from '../entities/entities.component';
import { LogsComponent } from '../logs/logs.component';
import { NgModule } from '@angular/core';
import { SentencesInboxComponent } from './sentences/sentences-inbox/sentences-inbox.component';
import { SentencesUnknownComponent } from './sentences/sentences-unknown/sentences-unknown.component';
import { SentencesSearchComponent } from './sentences/sentences-search/sentences-search.component';
import { LanguageUnderstandingTabsComponent } from './language-understanding-tabs/language-understanding-tabs.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: LanguageUnderstandingTabsComponent,
    resolve: {
      application: ApplicationResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'inbox',
        pathMatch: 'full'
      },
      {
        path: 'try',
        component: TryComponent
      },
      {
        path: 'inbox',
        component: SentencesInboxComponent
      },
      {
        path: 'unknown',
        component: SentencesUnknownComponent
      },
      {
        path: 'search',
        component: SentencesSearchComponent
      },
      {
        path: 'intents',
        component: IntentsComponent
      },
      {
        path: 'entities',
        component: EntitiesComponent
      },
      {
        path: 'logs',
        component: LogsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LanguageUndestandingRoutingModule {}
