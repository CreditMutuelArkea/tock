import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogsComponent } from '../logs/logs.component';
// import { InboxComponent } from '../inbox/inbox.component';
// import { ArchiveComponent } from '../archive/archive.component';
// import { SearchComponent } from '../search/search.component';
import { EntitiesComponent } from '../entities/entities.component';
import { IntentsComponent } from '../intents/intents.component';
import { TryComponent } from '../try/try.component';
import { ApplicationResolver } from '../core-nlp/application.resolver';
import { NlpTabsComponent } from './nlp-tabs.component';
import { AuthGuard } from '../core-nlp/auth/auth.guard';
import { SentencesSearchComponent } from '../sentences/sentences-search/sentences-search.component';
import { SentencesUnknownComponent } from '../sentences/sentences-unknown/sentences-unknown.component';
import { SentencesInboxComponent } from '../sentences/sentences-inbox/sentences-inbox.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: NlpTabsComponent,
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
        path: 'intents',
        component: IntentsComponent
      },
      {
        path: 'entities',
        component: EntitiesComponent
      },
      {
        path: 'search',
        component: SentencesSearchComponent
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
export class NlpRoutingModule {}
