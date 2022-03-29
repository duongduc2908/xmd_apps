import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'vai-line-bar-grouped-chart',
  templateUrl: './line-bar-grouped-chart.component.html',
  styleUrls: ['./line-bar-grouped-chart.component.scss']
})
export class LineBarGroupedChartComponent implements OnInit, OnChanges {
  @Input() chartData = null;
  chartHeight = 450;
  chartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
    },
    legend: {
      show: false,
    },
    grid: [{
      bottom: 300,
      left: 45,
      right: 0,
    }, {
      top: 230,
      left: 45,
      right: 0,
      bottom: 35,
    }],
    title: [{
      text: 'Tỉ lệ chuyển đổi đơn hàng(%)',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#353535',
        fontSize: 16,
        fontWeight: 600,
        fontFamily: 'Inter var'
      }
    },{
      text: 'So sánh số đơn hàng và số lượt ghé thăm',
      top: 180,
      left: 'center',
      textStyle: {
        color: '#353535',
        fontSize: 16,
        fontWeight: 600,
        fontFamily: 'Inter var'
      }
    }],
    xAxis: [{
      type: 'category',
      data: [],
      axisLabel: {
        interval: 0,
        show: false,
      },
      axisTick: {
        show: false,
      }
    },{
      gridIndex: 1,
      type: 'category',
      data: [],
      axisLabel: {
        interval: 0,
      },
      axisTick: {
        show: false,
      }
    }],
    yAxis: [{
      type: 'value',
      minInterval: 1,
      splitNumber: 2,
      splitLine: {
        lineStyle: {
          color: ['#C3C3C3'],
          type: 'dashed',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#C3C3C3',
        }
      },
      axisLabel: {
      }
    },{
      gridIndex: 1,
      type: 'value',
      minInterval: 1,
      splitNumber: 2,
      splitLine: {
        lineStyle: {
          color: ['#C3C3C3'],
          type: 'dashed',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#C3C3C3',
        }
      },
      axisLabel: {
      }
    }],
    series: []
  };
  private echartsInstance = null;

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
    if (!value) {
      return;
    }
    const _chartOption = cloneDeep(this.chartOption);
    const _seriesData = [];
    _seriesData.push({
      data: value.valueLabels.map((_, index) => value.data[index].conversionRate),
      type: 'line',
      color: '#FC993E',
      symbolSize: 8,
      symbol: 'emptyCircle',
      label: {show: true, position: 'top', color: '#353535', formatter: item => `${item.value}%`},
      emphasis: {focus: 'series'},
    });
    _seriesData.push({
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: value.valueLabels.map((_, index) => value.data[index].order),
      color: '#5A3FFF',
      type: 'bar',
      barWidth: 24,
      label: {show: true, position: 'top', color: '#353535'},
      emphasis: {focus: 'series'},
    });
    _seriesData.push({
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: value.valueLabels.map((_, index) => value.data[index].visit),
      color: '#1ED6FF',
      type: 'bar',
      barWidth: 24,
      label: {show: true, position: 'top', color: '#353535'},
      emphasis: {focus: 'series'},
    });
    _chartOption.xAxis[0].data = value.valueLabels;
    _chartOption.xAxis[1].data = value.valueLabels;
    _chartOption.series = _seriesData;
    this.chartOption = _chartOption;
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
