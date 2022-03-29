import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'vai-summary-chart',
  templateUrl: './summary-chart.component.html',
  styleUrls: ['./summary-chart.component.scss'],
})
export class SummaryChartComponent implements OnInit, AfterViewInit {
  @Input() chartData: ChartSummary;
  @ViewChild('VaiChart') vaiChart: ElementRef;
  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setColByItem();
  }

  getFirstValue(data: Array<any>): string {
    try {
      if (data.length > 0) {
        return data[0];
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  getDateTimeValue(data: Array<any>, unit: string): string {
    try {
      if (data.length > 0) {
        // eslint-disable-next-line arrow-parens
        const arr = data.map((time) => time + unit);
        return arr.join(' - ');
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  setColByItem(): void {
    if (this.vaiChart) {
      this.vaiChart.nativeElement.style.gridTemplateColumns = `repeat(${this.chartData.valueLabels.length}, minmax(0, 1fr))`;
    }
  }
}

export class ChartSummary {
  title: string;
  valueLabels: Array<any>;
  tooltips: Array<any>;
  data: Array<any>;
}
