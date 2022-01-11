import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {StateService} from 'src/app/core-nlp/state.service';
import {DEFAULT_PANEL_NAME, WithSidePanel} from '../common/mixin/with-side-panel';
import {blankFrequentQuestion, FrequentQuestion, QaStatus} from '../common/model/frequent-question';
import {FaqQaFilter, QaGridComponent} from './qa-grid/qa-grid.component';
import {QaSidebarEditorService} from './sidebars/qa-sidebar-editor.service';
import { truncate } from '../common/util/string-utils';
import { DialogService } from 'src/app/core-nlp/dialog.service';

// Specific action payload
export type EditorTabName = 'Info' | 'Answer' | 'Question';

@Component({
  selector: 'tock-qa',
  templateUrl: './qa.component.html',
  styleUrls: ['./qa.component.scss']
})
export class QaComponent extends WithSidePanel() implements OnInit, OnDestroy {

  activeQaTab: EditorTabName = 'Info';

  applicationName: string;
  currentItem?: FrequentQuestion;

  editorPanelName?: string;
  editorFormValid = false;

  public filter: FaqQaFilter;
  @ViewChild(QaGridComponent) grid;

  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private readonly state: StateService,
    private readonly sidebarEditorService: QaSidebarEditorService,
    private readonly dialog: DialogService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.filter = {
      sort: [],
      search: null,
      clone: function () {
        return {...this};
      }
    };

    this.applicationName = this.state.currentApplication.name;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  search(filter: Partial<FaqQaFilter>): void {

    this.filter.search = filter.search;
    this.filter.sort = filter.sort;

    this.grid.refresh();
  }

  openImportSidepanel() {
    this.dock("import");
  }

  edit(fq: FrequentQuestion): void {
    this.editorPanelName = 'Edit FAQ';
    this.currentItem = fq;

    this.dock("edit");
  }

  dock(name = DEFAULT_PANEL_NAME): void {
    if (name !== 'edit') {
      this.sidebarEditorService.leaveEditMode(); // tell other components we are done with editing now
    }
    super.dock(name); // toogle the docked/undocked state
  }

  undock(): void {
    this.sidebarEditorService.leaveEditMode(); // tell other components we are done with editing now
    super.undock(); // toogle the docked/undocked state
  }

  onEditorValidityChanged(value: boolean): void {
    window.setTimeout(() => { // ExpressionChangedAfterItHasBeenCheckedError workaround
      this.editorFormValid = value;
    }, 0);

  }

  openNewSidepanel() {
    this.editorPanelName = 'New FAQ';
    this.currentItem = blankFrequentQuestion();
    this.activeQaTab = 'Info';

    this.dock("edit");
  }

  details(fq: FrequentQuestion) {
    console.log("qa", fq);
  }

  activateEditorTab(tabName: EditorTabName): void {
    this.activeQaTab = tabName;
  }

  async save(): Promise<any> {
    const fq = await this.sidebarEditorService.save(this.destroy$);

    this.dialog.notify(`Saved`,
      truncate(fq.title || ''), {duration: 2000, status: "basic"});

    this.grid.refresh();
  }

}
