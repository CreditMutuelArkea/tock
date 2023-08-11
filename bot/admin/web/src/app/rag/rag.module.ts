import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RagTabsComponent } from './rag-tabs/rag-tabs.component';
import {
  NbButtonModule,
  NbCardModule,
  NbInputModule,
  NbRadioModule,
  NbRouteTabsetModule,
  NbSelectModule,
  NbSpinnerModule,
  NbToggleModule
} from '@nebular/theme';
import { RagSettingsComponent } from './rag-settings/rag-settings.component';
import { BotSharedModule } from '../shared/bot-shared.module';
import { RagRoutingModule } from './rag-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NlpModule } from '../nlp-tabs/nlp.module';
import { RagExcludedComponent } from './rag-excluded/rag-excluded.component';

@NgModule({
  imports: [
    CommonModule,
    BotSharedModule,
    RagRoutingModule,
    ReactiveFormsModule,
    NbRouteTabsetModule,
    NbSelectModule,
    NbToggleModule,
    NbRadioModule,
    NbSpinnerModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NlpModule
  ],
  declarations: [RagTabsComponent, RagSettingsComponent, RagExcludedComponent]
})
export class RagModule {}
