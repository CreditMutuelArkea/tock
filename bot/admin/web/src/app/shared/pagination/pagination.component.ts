import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface Pagination {
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
  @Input() pagination!: Pagination;
  @Input() pageSizes: number[] = [10, 25, 50, 100];

  @Output() onPaginationChange = new EventEmitter<Pagination>();

  ngOnInit() {
    if (!this.pageSizes.includes(this.pagination.pageSize)) {
      this.pageSizes = [...this.pageSizes, this.pagination.pageSize].sort(function (a, b) {
        return a - b;
      });
    }
  }

  paginationPrevious(): void {
    let pageStart = this.pagination.pageStart - this.pagination.pageSize;
    if (pageStart < 0) pageStart = 0;
    this.pagination.pageStart = pageStart;
    this.onPaginationChange.emit();
  }

  paginationNext(): void {
    this.pagination.pageStart = this.pagination.pageStart + this.pagination.pageSize;
    this.onPaginationChange.emit();
  }

  paginationSize(): void {
    this.onPaginationChange.emit();
  }

  paginationString(): string {
    return `${this.pagination.pageStart + 1} - ${this.pagination.pageEnd} of ${
      this.pagination.pageTotal
    }`;
  }

  showPrevious() {
    return this.pagination.pageStart > 0;
  }

  showNext() {
    return this.pagination.pageTotal > this.pagination.pageEnd;
  }
}
