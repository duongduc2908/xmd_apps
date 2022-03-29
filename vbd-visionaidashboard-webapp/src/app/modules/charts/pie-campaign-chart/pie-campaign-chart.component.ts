import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'vai-pie-campaign-chart',
  templateUrl: './pie-campaign-chart.component.html',
  styleUrls: ['./pie-campaign-chart.component.scss']
})
export class PieCampaignChartComponent implements OnInit, OnChanges {
  @Input() chartData = null;
  @Input() displayColumn = false;
  chartHeight = 240;
  chartLegend = [];
  chartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {trigger: 'item', position: 'right'},
    legend: {show: false},
    series: [
      {
        type: 'pie',
        radius: ['62%', '92%'],
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
    const data = value.valueLabels.map((label, index) => ({
      name: label,
      value: value.data[0].values[index],
      unit: value.data[0].valueUnit[index],
    }));
    _chartOption.series[0].data = [...data];
    _chartOption.series[0].color = value.colors;
    this.chartOption = _chartOption;
    this.chartLegend = data.map((item, index) => ({
      ...item,
      color: value.colors[index]
    }));
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
