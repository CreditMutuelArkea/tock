import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { Token } from '../models/token.model';
import { getContrastYIQ } from '../../../../../utils';

@Component({
  selector: 'tock-token-view',
  templateUrl: './token-view.component.html',
  styleUrls: ['./token-view.component.scss']
})
export class TokenViewComponent implements OnInit {
  @Input() tokens: Token[];

  @Output() displayTokenMenu = new EventEmitter<{ event: MouseEvent; token: Token }>();

  getContrastYIQ = getContrastYIQ;

  constructor() {}

  ngOnInit(): void {}

  displayMenu(args: { event: MouseEvent; token: Token }) {
    this.displayTokenMenu.emit(args);
  }

  @HostListener('mouseup', ['$event'])
  select(event?: MouseEvent) {
    event.stopPropagation();
    setTimeout((_) => {
      const windowsSelection = window.getSelection();
      console.log(windowsSelection);
      if (windowsSelection.rangeCount > 0) {
        const selection = windowsSelection.getRangeAt(0);
        let start = selection.startOffset;
        let end = selection.endOffset;
        if (selection.startContainer !== selection.endContainer) {
          if (!selection.startContainer.childNodes[0]) {
            return;
          }
          end = selection.startContainer.childNodes[0].textContent.length - start;
        } else {
          if (start > end) {
            const tmp = start;
            start = end;
            end = tmp;
          }
        }
        if (start === end) {
          return;
        }
        console.log(start, end);
      }
    });
  }
}
