import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'vai-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit, OnChanges {
  @Input() chartData = null;
  @Input() displayColumn = false;
  chartHeight = 160;
  chartLegend = [];
  chartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      confine: true
    },
    legend: {show: false},
    series: [
      {
        type: 'pie',
        radius: ['72%', '90%'],
        color: [],
        avoidLabelOverlap: false,
        label: {show: false},
        emphasis: {focus: 'self'},
        labelLine: {show: false},
        data: []
      }
    ],
  };
  private echartsInstance = null;

  constructor() {
  }

  get total(): number {
    if (!this.chartData) {return 0;}
    return this.chartData.data[0].values.reduce((s, value) => s + value, 0);
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
    const _chartLegend =[];
    const data = value.valueLabels.map((label, index) => ({name: label, value: value.data[0].values[index]}));
    _chartOption.series[0].data = [...data];
    _chartOption.series[0].color = value.colors;
    this.chartOption = _chartOption;
    let sumPercent = 0;
    for (let i = 0; i < data.length; i++) {
      const dataItem = data[i];
      const percent = this.total ? Math.round(dataItem.value / this.total * 100) : 0;
      const isGreaterThan100 = sumPercent + percent > 100;
      _chartLegend.push({
        ...dataItem,
        percent: (isGreaterThan100 || (sumPercent && i === data.length - 1) ? 100 - sumPercent : percent) + '%',
        color: value.colors[i]
      });
      sumPercent += isGreaterThan100 ? 100 - sumPercent : percent;
    }
    this.chartLegend = _chartLegend;
  }

  onChartInit(ec): void {
    this.echartsInstance = ec;
  }

  onMouseenter(index): void {
    this.echartsInstance.dispatchAction({
      type: 'highlight',
      dataIndex: index,
    });
  }

  onMouseleave(index): void {
    this.echartsInstance.dispatchAction({
      type: 'downplay',
      dataIndex: index,
    });
  }
}
