import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationResolver } from '../core-nlp/application.resolver';
import { AuthGuard } from '../core-nlp/auth/auth.guard';
import { FaqDefinitionComponent } from './faq-definition/faq-definition.component';
import { TrainComponent } from './train/train.component';

const routes: Routes = [
  {
    path: 'train',
    component: TrainComponent,
    canActivate: [AuthGuard],
    resolve: {
      application: ApplicationResolver
    }
  },
  {
    path: 'qa',
    component: FaqDefinitionComponent,
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
export class FaqRoutingModule {}
