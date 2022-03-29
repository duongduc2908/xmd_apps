import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as echarts from 'echarts';
import 'echarts-liquidfill';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'vai-circle-wave-chart',
  templateUrl: './circle-wave-chart.component.html',
  styleUrls: ['./circle-wave-chart.component.scss']
})
export class CircleWaveChartComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() title = '';
  @Input() tooltip = null;
  @Input() chartData = null;
  @ViewChild('chart') chart: ElementRef;
  size = 142;
  chartLegend = [];
  private valueChangeSource = new ReplaySubject<any>(1);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor() { }

  ngAfterViewInit(): void {
    this.valueChangeSource
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((newVal) => {
      if (!newVal) {return;}
      const _color = newVal.colors[0];
      this.setupChart(_color, newVal.data[0].rate / 100);
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('chartData' in changes) {
      this.valueChangeSource.next(changes.chartData.currentValue);
      this.setupLegend(changes.chartData.currentValue);
    }
  }

  setupChart(color, value): void {
    const chart = echarts.init(this.chart.nativeElement);
    const chartOption = {
      series: [{
        type: 'liquidFill',
        data: [value, value],
        color: [color],
        waveAnimation: false,
        animationDuration: 0,
        backgroundStyle: {
          color: 'transparent',
        },
        label: {
          fontSize: 32,
          color: '#FFFFFF'
        },
        outline: {
          borderDistance: 4,
          itemStyle: {
            borderWidth: 2,
            borderColor: color,
            opacity: 0.5,
          }
        }
      }]
    };
    chart.setOption(chartOption);
  }

  setupLegend(value): void {
    this.chartLegend = value.valueLabels.map((label, index) => ({
      color: value.colors[0],
      name: label,
      value: value.data[0].values[index]
    }));
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
