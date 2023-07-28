import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationResolver } from '../core-nlp/application.resolver';
import { AuthGuard } from '../core-nlp/auth/auth.guard';
import { BoardComponent } from './board/board.component';

const routes: Routes = [
  {
    path: 'board',
    component: BoardComponent,
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
