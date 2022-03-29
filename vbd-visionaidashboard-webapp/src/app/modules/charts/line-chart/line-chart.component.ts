import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'vai-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit, OnChanges {

  @Input() chartData = null;
  chartHeight = 250;
  chartLegend = [];
  chartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
    },
    legend: {show: false},
    grid: {
      left: 0,
      right: 0,
      top: '20px',
      bottom: 0,
      containLabel: true
    },
    xAxis: [
      {
        axisLabel: {
          interval: 0,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            type: 'dashed',
            color: 'rgba(255, 255, 255, 0.2)'
          }
        },
        type: 'category',
        data: []
      }
    ],
    yAxis: [
      {
        type: 'value',
        minInterval: 1,
        splitNumber: 3,
        axisLabel: {
          inside: false,
        },
        splitLine: {
          lineStyle: {
            color: ['rgba(255, 255, 255, 0.2)'],
            type: 'dashed',
          },
        }
      }
    ],
    series: []
  };
  private echartsInstance = null;
  private seriesItemSetting = {
    type: 'line',
    emphasis: {focus: 'series'},
  };
  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('chartData' in changes) {
      this.convertData(changes.chartData.currentValue);
    }
  }

  convertData(value): void {
    if (!value) { return; }
    const _chartOption = cloneDeep(this.chartOption);
    const xAxisData = [];
    const series = value.valueLabels.map(label => ({name: label, data: [], ...this.seriesItemSetting}));
    const dataLength = value.data.length;
    value.data.forEach((data) => {
      xAxisData.push(this.parseDateTime(data.dateTime));
      data.values.forEach((val, index) => {
        series[index].data.push(val);
        series[index].color = value.colors[index];
        series[index].symbolSize = 7;
      });
    });
    _chartOption.xAxis[0].data = xAxisData;
    _chartOption.xAxis[0].axisLabel.rotate = dataLength >= 30 ? 45 : 0;
    _chartOption.xAxis[0].axisLabel.interval = dataLength > 60 ? 2 : (dataLength > 30 ? 1 : 0);
    _chartOption.series = series;
    this.chartOption = _chartOption;
    this.chartLegend = value.valueLabels.map((label, index) => ({name: label, color: value.colors[index]}));
  }

  
  parseDateTime(val: string): string {
    if(isNaN((new Date(val)).valueOf())) {
      return val;
    }
    const date = new Date(val+"Z");
    const day = `${date.getDate()}`;
    const month = `${date.getMonth()+1}`;
    return `${day.length === 1 ? '0' : ''}${day} - ${month.length === 1 ? '0' : ''}${month}`;
  }


  onChartInit(ec): void {
    this.echartsInstance = ec;
  }

  onMouseenter(index): void {
    this.echartsInstance.dispatchAction({
      type: 'highlight',
      seriesIndex: index,
    });
  }

  onMouseleave(index): void {
    this.echartsInstance.dispatchAction({
      type: 'downplay',
      seriesIndex: index,
    });
  }
}
