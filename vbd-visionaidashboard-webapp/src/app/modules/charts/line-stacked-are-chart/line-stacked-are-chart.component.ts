import { Component, Input, OnChanges, OnInit, SimpleChanges, } from '@angular/core';
import { EChartsOption } from 'echarts';
import { cloneDeep } from 'lodash';
import { graphic } from 'echarts/core';

@Component({
  selector: 'vai-line-stacked-are-chart',
  templateUrl: './line-stacked-are-chart.component.html',
  styleUrls: ['./line-stacked-are-chart.component.scss']
})
export class LineStackedAreChartComponent implements OnInit, OnChanges {
  @Input() chartData = null;
  @Input() areaStyle = true;
  chartHeight = 260;
  chartLegend = [];
  chartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      confine: true,
    },
    legend: {
      show: false,
    },
    grid: {
      left: 0,
      right: 10,
      top: 15,
      bottom: 0,
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: [],
      },
    ],
    yAxis: [
      {
        type: 'value',
        minInterval: 1,
        splitNumber: 3,
        splitLine: {
          lineStyle: {
            color: ['rgba(255, 255, 255, 0.2)'],
            type: 'dashed',
          },
        },
      },
    ],
    series: [],
  };
  private _echartsInstance = null;

  constructor() {
  }

  get totalSeries(): number {
    if (!this.chartData?.data) {return 0;}
    return this.chartData.data.reduce((s, i) => s + i.total, 0);
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('chartData' in changes) {
      this.convertData(changes.chartData.currentValue);
    }
  }

  convertData(value): void {
    if (!value) {
      return;
    }
    const _chartOption = cloneDeep(this.chartOption);

    const _seriesData = [];
    value.data.forEach((item, index) => {
      _seriesData.push({
        name: value.valueLabels[index],
        data: item.values,
        color: value.colors[index],
        type: 'line',
        symbolSize: 7,
        stack: this.areaStyle ? 'Total' : null,
        emphasis: {
          focus: 'series',
        },
        areaStyle: this.areaStyle ? {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: value.colors[index]
            },
            {
              offset: 1,
              color: '#0A2645'
            }])
        } : null
      });
    });
    _chartOption.series = _seriesData;
    _chartOption.xAxis[0].data = value.data[0].valueUnit;
    this.chartOption = _chartOption;
    this.chartLegend = this.getChartLegend(value);
  }

  getChartLegend(chartData): any {
    if (!chartData) {return [];}
    const result = [];
    let sumPercent = 0;
    for (let i = 0; i < chartData.valueLabels.length; i++) {
      const label = chartData.valueLabels[i];
      const dataItem = chartData.data[i];
      const percent = this.totalSeries ? Math.round(dataItem.total / this.totalSeries * 100) : 0;
      const isGreaterThan100 = sumPercent + percent > 100;
      result.push({
        name: label,
        color: chartData.colors[i],
        total: dataItem.total,
        value: dataItem.values,
        valuePercents: this.getValuePercent(dataItem.values, dataItem.total),
        valueUnit: dataItem.valueUnit,
        percent: (isGreaterThan100 || (sumPercent && i === chartData.valueLabels.length - 1) ? 100 - sumPercent : percent) + '%',
      });
      sumPercent += isGreaterThan100 ? 100 - sumPercent : percent;
    }
    return result;
  }

  getValuePercent(data, total): any {
    if (!data || !total) {return [];}
    const result = [];
    let sumPercent = 0;
    for (let i = 0; i < data.length; i++) {
      const percent = Math.round(data[i] / total * 100);
      const isGreaterThan100 = sumPercent + percent > 100;
      result.push((isGreaterThan100 || (sumPercent && i === data.length - 1) ? 100 - sumPercent : percent) + '%');
      sumPercent += isGreaterThan100 ? 100 - sumPercent : percent;
    }
    return result;
  }

  onChartInit(ec): void {
    this._echartsInstance = ec;
  }

  onMouseenter(index): void {
    this._echartsInstance.dispatchAction({
      type: 'highlight',
      seriesIndex: index,
    });
  }

  onMouseleave(index): void {
    this._echartsInstance.dispatchAction({
      type: 'downplay',
      seriesIndex: index,
    });
  }
}
