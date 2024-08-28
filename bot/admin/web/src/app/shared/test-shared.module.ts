import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NbIconLibraries, NbThemeModule } from '@nebular/theme';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([]),

    NbThemeModule.forRoot({ name: 'default' })
  ],
  exports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class TestSharedModule {
  constructor(private iconLibraries: NbIconLibraries) {
    this.iconLibraries.registerFontPack('bootstrap-icons', { iconClassPrefix: 'bi' });
    this.iconLibraries.setDefaultPack('bootstrap-icons');
  }
}
