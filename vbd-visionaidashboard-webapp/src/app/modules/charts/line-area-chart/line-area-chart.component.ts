import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'vai-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  styleUrls: ['./line-area-chart.component.scss']
})
export class LineAreaChartComponent implements OnInit, OnChanges {

  @Input() chartData = null;
  chartHeight = 250;
  chartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
    },
    legend: {show: false},
    grid: [{
      left: 45,
      right: 0,
      top: 15,
      bottom: 35,
    }],
    xAxis: [
      {
        axisLabel: {},
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
            color: ['#C3C3C3'],
            type: 'dashed',
          },
        },
        axisLine: {
          lineStyle: {
            color: '#C3C3C3',
          }
        },
      }
    ],
    series: []
  };
  private echartsInstance = null;
  private seriesItemSetting = {
    type: 'line',
    emphasis: {focus: 'series'},
    showSymbol: false,
    // smooth: true,
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
    value.data.forEach((data) => {
      xAxisData.push(data.dateTime);
      data.values.forEach((val, index) => {
        series[index].data.push(val);
        series[index].color = '#5A3FFF';
        if (index === 1) {
          series[index].areaStyle = {
            color: 'rgba(49, 151, 255, 0.2)',
            opacity: 0.8,
          };
          series[index].lineStyle = {width: 0};
          series[index].smooth = true;
        }
      });
    });
    _chartOption.xAxis[0].data = xAxisData;
    _chartOption.xAxis[0].axisLabel.rotate = value.data.length >=30 ? 45 : 0;
    _chartOption.series = series;
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
