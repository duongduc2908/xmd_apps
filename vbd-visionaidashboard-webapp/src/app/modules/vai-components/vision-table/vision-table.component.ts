import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'vai-vision-table',
  templateUrl: './vision-table.component.html',
  styleUrls: ['./vision-table.component.scss']
})
export class VisionTableComponent implements OnInit, OnChanges {
  @Input() dataSource = [];
  @Input() displayedColumns = [];
  @Input() class = '';
  @Input() isTimeFormat = false;
  @Input() dateFormat = 'DD-MM-YYYY HH:mm:ss';
  @Input() dayFormat = 'DD-MM-YYYY';
  @Input() timeFormat = 'HH:mm:ss';
  @Output() action = new EventEmitter();
  columnData = [];
  constructor() { }

  ngOnInit(): void {
console.log(this.dataSource)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('displayedColumns' in changes) {
      // eslint-disable-next-line arrow-parens
      this.columnData = this.displayedColumns.map((_item) => _item.columName);
    }
  }

  onClickAction(action, element): void {
    this.action.emit({ action, element });
  }

  getDate(value): string {
    return value ? moment(value).format(this.dayFormat) : null; 
  }

  getTime(value): string {
    return value ? moment(value.replace("Z","")).format(this.timeFormat) : null;
  }

}
