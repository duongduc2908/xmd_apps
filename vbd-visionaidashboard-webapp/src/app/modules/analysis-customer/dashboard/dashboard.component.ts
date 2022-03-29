import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnalyticsFilterService, DEFAULT_ANALYTICS_FILTER } from 'app/services/analytics-filter.service';
import { AnalyticsCustomerService } from 'app/services/analytics-customer.service';
import { ChartUtils } from 'app/utils/chart.utils';
import { ConfigService } from 'app/services/config.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'analysis-customer-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class AnalysisCustomerDashboardComponent implements OnInit, OnDestroy {
  customVisitByTimeChartData: any;
  customVisitByGenderChartData: any;
  customVisitByAgeChartData: any;
  customVisitAvgByAgeChartData: any;
  customerVisitSummaryChartData: any;
  averageVisitCustomerChartData: any;

  chartsConfig: any;
  storeSelectedIndex = 0;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _analyticsFilter: AnalyticsFilterService,
    private _configService: ConfigService,
    private _analyticsCustomerService: AnalyticsCustomerService,
  ) {
    this._configService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(_config => this.chartsConfig = _config);
    this._analyticsFilter.filterParams$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({isSearch, ...params}) => {
        if (isSearch) {
          this.getChartDataCustomerVisitByTime(params);
          this.getChartDataCustomerVisitByGender(params);
          this.getChartDataCustomerVisitByAge(params);
          this.getChartDataCustomerVisitAvgByAge(params);
          this.getChartDataCustomerVisitSummary(params);
          this.getChartDataAverageVisitCustomer(params);
        }
      });
  }

  ngOnInit(): void {
    this._analyticsFilter.setFilterParam({
      ...DEFAULT_ANALYTICS_FILTER,
      showroomType: null,
      isSearch: true,
    });
  }

  getChartDataCustomerVisitByTime(payload): any {
    this._analyticsCustomerService
      .search({...payload}, 'customer/situation')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({data}) => {
        const _chartType = 'situation';
        const _chart = data[this.storeSelectedIndex];
        if (!_chart) {return; }
        const _valueLabels = _chart.data.map(item => item.gender);
        const _categories = _chart.categories;
        this.customVisitByTimeChartData = {
          title: ChartUtils.getChartTitle(this.chartsConfig, _chartType),
          colors: ChartUtils.getChartColorsByType(this.chartsConfig, 'gender'),
          valueLabels: _valueLabels,
          data: _categories.map((category, categoryIndex) => ({
            dateTime: category,
            values: _valueLabels.map((_, valueIndex) => _chart.data[valueIndex].value[categoryIndex])
          })),
        };
      });
  }

  getChartDataCustomerVisitByGender(payload): any {
    this._analyticsCustomerService
      .search({...payload}, 'customer/rate-by-gender')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({data}) => {
        const _chartType = 'rate_by_gender';
        const _chart = data[this.storeSelectedIndex];
        if (!_chart) {
          return;
        }
        this.customVisitByGenderChartData = {
          title: ChartUtils.getChartTitle(this.chartsConfig, _chartType),
          colors: ChartUtils.getChartColorsByType(this.chartsConfig, 'gender'),
          valueLabels: _chart.data.map(item => item.gender),
          data: [{
            values: _chart.data.map(item => item.value)
          }],
        };
      });
  }

  getChartDataCustomerVisitByAge(payload): any {
    this._analyticsCustomerService
      .search({...payload}, 'customer/rate-by-age')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({data}) => {
        const _chartType = 'rate_by_age';
        const _chart = data[this.storeSelectedIndex];
        if (!_chart) {
          return;
        }
        this.customVisitByAgeChartData = {
          title: ChartUtils.getChartTitle(this.chartsConfig, _chartType),
          colors: ChartUtils.getChartColorsByType(this.chartsConfig, 'age'),
          valueLabels: _chart.data.map(item => item.age_type),
          data: [{
            values: _chart.data.map(item => item.value)
          }],
        };
      });
  }

  getChartDataCustomerVisitAvgByAge(payload): any {
    this._analyticsCustomerService
      .search({...payload}, 'customer/average-by-gender')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({data}) => {
        const _chartType = 'average_by_gender';
        const _chart = data[this.storeSelectedIndex];
        if (!_chart) {
          return;
        }
        this.customVisitAvgByAgeChartData = {
          title: ChartUtils.getChartTitle(this.chartsConfig, _chartType),
          colors: ChartUtils.getChartColorsByType(this.chartsConfig, 'gender'),
          valueLabels: _chart.data.map(item => item.gender),
          tooltipFormatValue: ChartUtils.tooltipMinuteFormat,
          data: [{
            values: _chart.data.map(item => item.value),
            valueUnits: _chart.data.map(_ => 'phút')
          }],
        };
      });
  }

  getChartDataCustomerVisitSummary(payload): any {
    forkJoin([
      this._analyticsCustomerService
        .search({...payload}, 'customer/total-visits'),
      this._analyticsCustomerService
        .search({...payload}, 'customer/average-visits-time'),
      this._analyticsCustomerService
        .search({...payload}, 'customer/quests-in-peak-hour'),
      this._analyticsCustomerService
        .search({...payload}, 'customer/come-back-quests'),
    ])
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
      const _valueLabels = [];
      const _tooltips = [];
      const _data = [];
      [
        'total_visits',
        'average_visits_time',
        'quests_in_peak_hour',
        'come_back_quests',
      ].forEach((chartType, index) => {
        const _chart = _analyticsData[index].data[this.storeSelectedIndex];
        if (!_chart) {
          return;
        }
        _valueLabels.push(ChartUtils.getChartTitle(this.chartsConfig, chartType));
        _tooltips.push(_analyticsData[index].tooltip);
        _data.push({
          dateTime: null,
          value: [_chart.value],
          valueUnit: [_chart.value_unit],
          valueChange: [_chart.change_value],
          valueChangeUnit: [_chart.change_value_unit],
          peakRange: _chart.peak_range,
          valueChangeAction: _chart.change_type ? (_chart.change_type === 'negative' ? 'down' : 'up') : null,
          tooltipPosition: 'top',
        });
      });
      this.customerVisitSummaryChartData = {
        valueLabels: _valueLabels,
        tooltips: _tooltips,
        data: _data,
      };
    });
  }

  getChartDataAverageVisitCustomer(payload): any {
    forkJoin([
      this._analyticsCustomerService
        .search({...payload}, 'customer/nearest-average-by-times'),
      this._analyticsCustomerService
        .search({...payload}, 'customer/average-by-turns'),
      this._analyticsCustomerService
        .search({...payload}, 'customer/average-by-time-period-back'),
    ])
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
      const _valueLabels = [];
      const _tooltips = [];
      const _data = [];
      [
        'nearest_average_by_times',
        'average_by_turns',
        'average_by_time_period_back',
      ].forEach((chartType, index) => {
        const _chart = _analyticsData[index].data[this.storeSelectedIndex];
        if (!_chart) {
          return;
        }
        _valueLabels.push(ChartUtils.getChartTitle(this.chartsConfig, chartType));
        _tooltips.push(_analyticsData[index].tooltip);
        _data.push({
          dateTime: null,
          value: [_chart.value],
          valueUnit: [_chart.value_unit],
          valueChange: [_chart.change_value],
          peakRange: _chart.peak_range,
          valueChangeAction: _chart.change_type ? (_chart.change_type === 'negative' ? 'up' : 'down') : null,
          tooltipPosition: 'bottom',
        });
      });
      this.averageVisitCustomerChartData = {
        valueLabels: _valueLabels,
        tooltips: _tooltips,
        data: _data,
      };
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
