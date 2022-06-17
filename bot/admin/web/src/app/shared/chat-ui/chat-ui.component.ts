import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tock-chat-ui',
  templateUrl: './chat-ui.component.html',
  styleUrls: ['./chat-ui.component.scss']
})
export class ChatUiComponent implements OnInit {
  @Input() height: string;
  constructor() {}

  ngOnInit(): void {
    console.log(this.height);
  }
}
