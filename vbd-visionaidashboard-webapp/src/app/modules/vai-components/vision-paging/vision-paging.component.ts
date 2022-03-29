import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'vai-vision-paging',
  templateUrl: './vision-paging.component.html',
  styleUrls: ['./vision-paging.component.scss']
})
export class VisionPagingComponent implements OnInit {
  @ViewChild(MatPaginator, {static: true})
  paginator: MatPaginator;
  @Input() paging = {
    length: 0,
    pageIndex: 0,
    pageSize: 10,
  };
  @Output() pageChange: EventEmitter<any> = new EventEmitter<any>();
  decimalPipe = new DecimalPipe(navigator.language);

  constructor() {
  }

  ngOnInit(): void {
    this.paginator._intl.itemsPerPageLabel = 'Dữ liệu hiển thị:';
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      if (length === 0 || pageSize === 0) {
        return `0 / ${length}`;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} của ${length}`;
    };
  }

  onPageChange(e): void {
    this.pageChange.emit(e);
  }

}
