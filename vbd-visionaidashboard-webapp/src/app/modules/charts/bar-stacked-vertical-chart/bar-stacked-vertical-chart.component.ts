import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { LogsCustomerService } from 'app/services/logs-customer.service';
import { EChartsOption } from 'echarts';
import { cloneDeep } from 'lodash';
@Component({
  selector: 'vai-bar-stacked-vertical-chart',
  templateUrl: './bar-stacked-vertical-chart.component.html',
  styleUrls: ['./bar-stacked-vertical-chart.component.scss']
})
export class BarStackedVerticalChartComponent implements OnInit, OnChanges {
  @Input() chartData = null;
  chartHeight = 250;
  chartLegend = [];
  chartOption: EChartsOption = {
    backgroundColor: 'transparent',
    legend: {show: false},
    grid: {
      left: 0,
      right: 0,
      top: '20px',
      bottom: 0,
      containLabel: true
    },
    tooltip: [{
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    }],
    xAxis: [
      {
        type: 'category',
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
        data: [],
        triggerEvent: true
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
        },
      }
    ],
    series: []
  };
  private _chartData = null;
  private echartsInstance = null;
  private seriesItemSetting = {
    type: 'bar',
    stack: 'Ad',
    emphasis: {focus: 'series'},
    barWidth: 24,
  };
  constructor(
    private _router: Router,
    private _logsCustomerService: LogsCustomerService,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('chartData' in changes) {
      this._chartData = changes.chartData.currentValue;
      this.convertData(changes.chartData.currentValue);
    }
  }

 
  getChartLabelConfig(series): any {
    return {
      label: {
        normal: {
          show: true,
          position: 'top',
          color: '#fff',
          formatter: (params): string => {
            if (!series) { return '0';}
            return series.reduce((s, i) => s + i.data[params.dataIndex], 0) + '';
          }
        }
      }
    };
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

  convertData(value): void {
    if (!value) { return; }
    const _chartOption = cloneDeep(this.chartOption);
    const xAxisData = [];
    const dataLength = value.data.length;
    const xAxisInterval = dataLength > 60 ? 2 : (dataLength > 30 ? 1 : 0);
    _chartOption.xAxis[0].data = xAxisData;
    _chartOption.xAxis[0].axisLabel.rotate = dataLength >= 30 ? 45 : 0;
    _chartOption.xAxis[0].axisLabel.interval = xAxisInterval;
    _chartOption.tooltip[0].axisPointer = xAxisInterval ? {} : {type: 'shadow'};
    const series = value.valueLabels.map(label => ({
      ...this.seriesItemSetting,
      name: label,
      data: [],
    }));
    let indexShow = 0;
    value.data.forEach((data, valIndex) => {
      xAxisData.push(this.parseDateTime(data.dateTime));
      const isShow = (valIndex === 0) || (indexShow + xAxisInterval) < valIndex;
      indexShow = isShow ? valIndex : indexShow;
      data.values.forEach((val, index) => {
        if (isShow) {
          series[index].data.push(val);
        } else {
            series[index].data.push({
              value: val,
              itemStyle: {
                opacity: 0,
              },
              emphasis: {
                disabled: true,
              }
            });
        }
        series[index].color = value.colors[index];
      });
    });
    series[series.length - 1] = {...series[series.length - 1], ...this.getChartLabelConfig(series)};
    _chartOption.series = series;
    this.chartOption = _chartOption;
    this.chartLegend = value.valueLabels.map((label, index) => ({name: label, color: value.colors[index]}));
  }


  onChartInit(ec): void {
    this.echartsInstance = ec;
    // this.echartsInstance.on('click', p => {
    //   const dateSelected: Date = this._chartData.data[p['dataIndex']].dateTime;
    //   this._logsCustomerService.data = dateSelected;
    //   this._router.navigate(["logs-customer/customer-activities"]);
    // })
  }
  onChartClick(p) {
    const dateSelected: Date = this._chartData.data[p['dataIndex']].dateTime;
      this._logsCustomerService.data = dateSelected;
      this._router.navigate(["logs-customer/customer-activities"]);
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
