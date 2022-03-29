import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { EChartsOption } from 'echarts';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'vai-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit, OnChanges {
  @Input() chartData = null;
  @Input() isShowLegend = true;
  @Input() isConvertYAxisLabelToHours = true;
  @Input() unit = '';
  chartHeight = 160;
  chartLegend = [];
  chartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      // position: 'top',
      confine: true,
    },
    legend: {
      show: false,
    },
    grid: {
      left: 0,
      right: 15,
      top: 17,
      bottom: 0,
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: [],
        axisLabel: {
          interval: 0,
        },
        axisTick: {
          show: false,
        },
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
        axisLabel: {},
      },
    ],
    series: [
      {
        data: [],
        type: 'bar',
        barWidth: 24,
        showBackground: true,
        label: { show: true, position: 'top', color: '#fff' },
        emphasis: { focus: 'self' },
        backgroundStyle: {
          color: 'rgba(49, 151, 255, 0.1)',
        },
      },
    ],
  };
  private echartsInstance = null;

  constructor() {}

  ngOnInit(): void {}

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
    const _chartLegend = [];
    const _seriesData = [];
    const _hasUnit =
      value.data[0].valueUnits && value.data[0].valueUnits.length;
    value.valueLabels.forEach((label, index) => {
      const _color = value.colors[index];
      const _value = value.data[0].values[index];
      _chartLegend.push({
        name: label,
        value: _value,
        color: _color,
        unit: _hasUnit ? value.data[0].valueUnits[index] : '',
      });
      _seriesData.push({
        value: _value,
        itemStyle: { color: _color },
      });
    });
    
    _chartOption.xAxis[0].data = value.valueLabels;
    _chartOption.series[0].data = _seriesData;
    if (value.tooltipFormatValue) {
      // @ts-ignore
      _chartOption.tooltip.valueFormatter = value.tooltipFormatValue;
    }
    this.chartOption = _chartOption;
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
