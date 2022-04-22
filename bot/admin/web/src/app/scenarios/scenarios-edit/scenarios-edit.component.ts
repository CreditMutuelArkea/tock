/*
 * Copyright (C) 2017/2021 e-voyageurs technologies
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditorServiceService } from './editor-service.service';
import { storyCollectorItem } from './story-collector.types';
import * as mockingStories from './mocking-data';

@Component({
  selector: 'scenarios-edit',
  templateUrl: './scenarios-edit.component.html',
  styleUrls: ['./scenarios-edit.component.scss']
})
export class ScenariosEditComponent implements OnInit {
  destroy = new Subject();
  @ViewChild('canvasWrapperElem') canvasWrapperElem: ElementRef;
  @ViewChild('canvasElem') canvasElem: ElementRef;

  story: storyCollectorItem[]; //= mockingStories.mockingStory_1

  constructor(private editorService: EditorServiceService) {}

  ngOnInit(): void {
    this.editorService.editorItemsCommunication.pipe(takeUntil(this.destroy)).subscribe((evt) => {
      if (evt.type == 'addAnswer') this.addAnswer(evt.item);
      if (evt.type == 'deleteAnswer') this.deleteAnswer(evt.item, evt.parentItemId);
      if (evt.type == 'itemDropped') this.itemDropped(evt.targetId, evt.droppedId);
      if (evt.type == 'itemSelected') this.selectItem(evt.item);
      if (evt.type == 'testItem') this.testStory(evt.item);
    });

    this.mockData(1);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.centerCanvas();
    }, 0);
  }

  clearStory(): void {
    this.story = [
      {
        id: 0,
        from: 'client',
        text: ''
      }
    ];
    this.nextId = this.story.length;
    this.centerCanvas();
  }

  mockData(which): void {
    this.story = [];
    this.story = JSON.parse(JSON.stringify(mockingStories[`mockingStory_${which}`]));
    let nextId = 0;
    this.story.forEach((element) => {
      if (element.id > nextId) nextId = element.id;
    });
    this.nextId = nextId;
    setTimeout(() => {
      this.canvasScale = 1;
      this.centerCanvas();
    }, 0);
  }

  exportStory(): void {
    let json = JSON.stringify(this.story);
    navigator.clipboard.writeText(json);
    console.log(json);
  }

  deleteAnswer(itemRef: storyCollectorItem, parentItemId: number): void {
    if (itemRef.parentIds.length > 1) {
      itemRef.parentIds = itemRef.parentIds.filter((pi) => pi != parentItemId);
    } else {
      this.story = this.story.filter((item) => item.id != itemRef.id);
    }
  }

  nextId;

  addAnswer(itemRef: storyCollectorItem, from?: string): void {
    let fromType = from || 'client';
    let newEntry: storyCollectorItem = {
      id: ++this.nextId,
      parentIds: [itemRef.id],
      from: fromType,
      text: ''
    };

    if (from == undefined && (itemRef.from == 'client' || itemRef.from == 'verification')) {
      newEntry.from = 'bot';
      // newEntry.botAnswerType = "question"
    }

    this.story.push(newEntry);

    setTimeout(() => {
      this.selectItem(newEntry);
      this.editorService.focusItem(newEntry);
    }, 0);
  }

  selectedItem: storyCollectorItem;

  selectItem(item?: storyCollectorItem): void {
    this.selectedItem = item ? item : undefined;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent): void {
    if (this.selectedItem) {
      if ($event.altKey) {
        if ($event.key == 'c') {
          this.addAnswer(this.selectedItem, 'client');
        }
        if ($event.key == 'b') {
          this.addAnswer(this.selectedItem, 'bot');
        }
        if ($event.key == 'v') {
          this.addAnswer(this.selectedItem, 'verification');
        }
        if ($event.key == 'n') {
          this.addAnswer(this.selectedItem);
        }
      }
    }
  }

  itemDropped(targetId: number, droppedId: number): void {
    let targeted = this.findItemById(targetId);
    let dropped = this.findItemById(droppedId);

    if (dropped.parentIds === undefined) return;
    if (dropped.parentIds.includes(targetId)) return;
    if (this.isInFiliation(targeted, dropped)) return;

    if (this.findItemChild(dropped)) dropped.parentIds = [targetId];
    else dropped.parentIds.push(targetId);
  }

  isInFiliation(parent: storyCollectorItem, child: storyCollectorItem): boolean {
    let current = parent;
    while (true) {
      if (!current.parentIds) return false;
      current = this.findItemById(current.parentIds[0]);
      if (!current) return false;
      if (current.id == child.id) return true;
    }
  }

  mouseWheel(event: WheelEvent) {
    event.preventDefault();
    this.zoomCanvas(event);
  }

  canvasPos = { x: 0, y: 0 };
  canvasPosOffset = { x: 0, y: 0 };
  pointer = { x: 0, y: 0 };
  canvasScale = 1;
  zoomSpeed = 0.5;
  isDragingCanvas;

  zoomCanvas(event: WheelEvent) {
    let wrapper = this.canvasWrapperElem.nativeElement;
    let canvas = this.canvasElem.nativeElement;

    this.pointer.x = event.clientX - wrapper.offsetLeft;
    this.pointer.y = event.clientY - wrapper.offsetTop;
    this.canvasPosOffset.x = (this.pointer.x - this.canvasPos.x) / this.canvasScale;
    this.canvasPosOffset.y = (this.pointer.y - this.canvasPos.y) / this.canvasScale;

    this.canvasScale +=
      -1 * Math.max(-1, Math.min(1, event.deltaY)) * this.zoomSpeed * this.canvasScale;
    const max_scale = 1;
    const min_scale = 0.2;
    this.canvasScale = Math.max(min_scale, Math.min(max_scale, this.canvasScale));

    this.canvasPos.x = -this.canvasPosOffset.x * this.canvasScale + this.pointer.x;
    this.canvasPos.y = -this.canvasPosOffset.y * this.canvasScale + this.pointer.y;

    canvas.style.transform = `translate(${this.canvasPos.x}px,${this.canvasPos.y}px) scale(${this.canvasScale},${this.canvasScale})`;
  }

  @HostListener('window:contextmenu', ['$event'])
  onContextMenuCanvas(event: MouseEvent) {
    event.preventDefault();
  }
  @HostListener('mousedown', ['$event'])
  onMouseDownCanvas(event: MouseEvent) {
    if (event.which == 3) {
      this.isDragingCanvas = {
        left: this.canvasPos.x,
        top: this.canvasPos.y,
        x: event.clientX,
        y: event.clientY
      };
      let canvas = this.canvasElem.nativeElement;
      canvas.style.transition = 'unset';
    }
  }
  @HostListener('mouseup', ['$event'])
  onMouseUpCanvas(event: MouseEvent) {
    if (event.which == 3) {
      this.isDragingCanvas = undefined;
      let canvas = this.canvasElem.nativeElement;
      canvas.style.transition = 'transform .3s';
    }
  }
  @HostListener('mousemove', ['$event'])
  onMouseMoveCanvas(event: MouseEvent) {
    if (this.isDragingCanvas && event.which == 3) {
      let canvas = this.canvasElem.nativeElement;
      const dx = event.clientX - this.isDragingCanvas.x;
      const dy = event.clientY - this.isDragingCanvas.y;
      this.canvasPos.x = this.isDragingCanvas.left + dx;
      this.canvasPos.y = this.isDragingCanvas.top + dy;
      canvas.style.transform = `translate(${this.canvasPos.x}px,${this.canvasPos.y}px) scale(${this.canvasScale},${this.canvasScale})`;
    }
  }

  centerCanvas(): void {
    let wrapper = this.canvasWrapperElem.nativeElement;
    let canvas = this.canvasElem.nativeElement;
    this.canvasPos.x = ((canvas.offsetWidth * this.canvasScale - wrapper.offsetWidth) / 2) * -1;
    this.canvasPos.y = 0;

    canvas.style.transform = `translate(${this.canvasPos.x}px,${this.canvasPos.y}px) scale(${this.canvasScale},${this.canvasScale})`;
  }

  chatDisplayed = false;
  chatControlsDisplay = false;
  chatControlsFrom;
  chatPropositions;

  stopPropagation(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  closeChat(): void {
    this.chatDisplayed = false;
    this.chatPropositions = undefined;
    this.chatControlsFrom = undefined;
    this.chatControlsDisplay = false;
  }

  testStory(item?): void {
    this.messages = [];

    if (!item) {
      item = this.findItemById(0);
    }

    this.chatPropositions = undefined;
    this.chatControlsFrom = undefined;
    this.chatControlsDisplay = false;
    this.processChatEntry(item);
    this.chatDisplayed = true;
  }

  chatResponsesTimeout = 1000;

  processChatEntry(item: storyCollectorItem): void {
    // let item = this.findItemById(itemIndex)

    if (item) {
      // if(this.isItemOnlyChild(item)){
      this.addChatMessage(item.from, item.text);

      let children = this.getChildren(item);
      if (children.length < 1) return;

      if (children.length == 1) {
        setTimeout(() => {
          this.processChatEntry(children[0]);
        }, this.chatResponsesTimeout);
      } else {
        this.makePropositions(children[0]);
      }
      // }
      // else{
      //   this.makePropositions(item)
      // }
    }
  }

  makePropositions(item: storyCollectorItem): void {
    this.chatPropositions = this.getBrotherhood(item);
    let from = item.from;
    this.chatControlsFrom = from;
    this.chatControlsDisplay = true;
  }

  chooseProposition(item: storyCollectorItem): void {
    this.chatPropositions = undefined;
    this.chatControlsFrom = undefined;
    this.chatControlsDisplay = false;
    this.addChatMessage(item.from, item.text);
    let child = this.findItemChild(item);
    if (child) {
      setTimeout(() => {
        this.processChatEntry(child);
      }, this.chatResponsesTimeout);
    }
  }

  findItemChild(item: storyCollectorItem): storyCollectorItem {
    return this.story.find((oitem) => oitem.parentIds?.includes(item.id));
  }

  findItemById(id: number): storyCollectorItem {
    return this.story.find((oitem) => oitem.id == id);
  }

  getChildren(item: storyCollectorItem): storyCollectorItem[] {
    return this.story.filter((oitem) => oitem.parentIds?.includes(item.id));
  }

  getBrotherhood(item: storyCollectorItem): storyCollectorItem[] {
    return this.story.filter((oitem) =>
      oitem.parentIds?.some((oip) => item.parentIds?.includes(oip))
    );
  }

  getItemBrothers(item: storyCollectorItem): storyCollectorItem[] {
    return this.getBrotherhood(item).filter((oitem) => oitem.id !== item.id);
  }

  isItemOnlyChild(item: storyCollectorItem): boolean {
    if (!this.getItemBrothers(item).length) return true;
    return false;
  }

  userIdentities = {
    client: { name: 'Pierre Martin', avatar: 'assets/images/scenario-client.svg' },
    bot: { name: 'Bot', avatar: 'assets/images/scenario-bot.svg' },
    verification: { name: 'Vérification', avatar: 'assets/images/scenario-verification.svg' }
  };

  addChatMessage(from: string, text: string, type: string = 'text'): void {
    let user;
    switch (from) {
      case 'client':
        user = this.userIdentities.client;
        break;
      case 'bot':
        user = this.userIdentities.bot;
        break;
      case 'verification':
        user = this.userIdentities.verification;
        break;
    }

    this.messages.push({
      text: text,
      date: new Date(),
      reply: from == 'client' ? true : false,
      type: type,
      user: user
    });
  }

  messages: any[] = [];

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
