import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface pagination {
  pageSize: number;
  pageStart: number;
  pageEnd: number;
  pageTotal: number;
}

@Component({
  selector: 'tock-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  @Input() pagination: pagination;
  @Output() onPaginationChange = new EventEmitter<pagination>();

  paginationSizeStr;

  ngOnInit(): void {
    this.paginationSizeStr = String(this.pagination.pageSize);
  }

  paginationPrevious(): void {
    let pageStart = this.pagination.pageStart - this.pagination.pageSize;
    if (pageStart < 0) pageStart = 0;
    this.pagination.pageStart = pageStart;
    this.onPaginationChange.emit(this.pagination);
  }

  paginationNext(): void {
    let pageStart = this.pagination.pageStart + this.pagination.pageSize;
    this.pagination.pageStart = pageStart;
    this.onPaginationChange.emit(this.pagination);
  }

  paginationSize(): void {
    this.pagination.pageSize = parseInt(this.paginationSizeStr);
    this.onPaginationChange.emit(this.pagination);
  }

  paginationString(): string {
    return `${this.pagination.pageStart + 1} - ${this.pagination.pageEnd} of ${
      this.pagination.pageTotal
    }`;
  }
}
