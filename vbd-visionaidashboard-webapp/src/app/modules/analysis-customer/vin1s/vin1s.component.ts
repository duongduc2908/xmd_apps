import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnalyticsFilterService, DEFAULT_ANALYTICS_FILTER } from '../../../services/analytics-filter.service';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsCustomerService } from '../../../services/analytics-customer.service';
import { ChartUtils } from '../../../utils/chart.utils';
import { ConfigService } from '../../../services/config.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'analysis-customer-vin1s',
  templateUrl: './vin1s.component.html',
  styleUrls: ['./vin1s.component.scss']
})
export class AnalysisCustomerVin1sComponent implements OnInit, OnDestroy {
  totalVisitChartData: any;
  timeVisitAvgChartData: any;
  customerVisitAtRushHourChartData: any;
  situationCompareChartData: any;
  customVisitByGenderChartData: any;
  customVisitByAgeChartData: any;
  nearestAverageByTimesChartData: any;
  averageByTimePeriodBackChartData: any;
  averageByTurnsChartData: any;
  chartsConfig: any;
  showroomType = null;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _route: ActivatedRoute,
    private _configService: ConfigService,
    private _analyticsCustomerService: AnalyticsCustomerService,
    private _analyticsFilter: AnalyticsFilterService
  ) {
    this._configService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(_config => this.chartsConfig = _config);

    this._analyticsFilter.filterParams$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ isSearch, ..._filterParams }) => {
        if (isSearch) {
          const params = { ..._filterParams, showroomType: this.showroomType };
          this.getChartDataTotalVisit(params);
          this.getChartDataTimeVisitAvg(params);
          this.getChartDataCustomerVisitAtRushHour(params);
          this.getChartDataSituationCompare(params);
          this.getChartDataCustomVisitByGender(params);
          this.getChartDataCustomVisitByAge(params);
          this.getChartDataNearestAverageByTimes(params);
          this.getChartDataAverageByTimePeriodBack(params);
          this.getChartDataAverageByTurns(params);
        }
      });
  }

  ngOnInit(): void {
    this._route.data
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_data) => {
        this.showroomType = _data.showroomType;
        this._analyticsFilter.setFilterParam({
          ...DEFAULT_ANALYTICS_FILTER,
          showroomType: _data.showroomType,
          isSearch: true,
        });
      });
  }

  getChartDataTotalVisit(payload): any {
    this._analyticsCustomerService
      .search({ ...payload }, 'customer/total-visits')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
        const _chartType = 'total_visits';
        const _charts = _analyticsData.data;
        const _stores = _analyticsData.stores;
        if (!_stores || !_stores.length) {
          return;
        }
        this.totalVisitChartData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          valueLabels: _stores.map(_store => _store.name),
          colors: this.chartsConfig.colorCompares,
          data: [{
            values: _stores.map((_store) => {
              const dataForStore = _charts.find(_chart => _chart.store === _store.id);
              return dataForStore ? dataForStore.value : 0;
            }),
          }]
        };
      });
  }

  getChartDataTimeVisitAvg(payload): any {
    this._analyticsCustomerService
      .search({ ...payload }, 'customer/average-visits-time')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
        const _chartType = 'average_visits_time';
        const _charts = _analyticsData.data;
        const _stores = _analyticsData.stores;
        if (!_stores || !_stores.length) {
          return;
        }
        this.timeVisitAvgChartData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          valueLabels: _stores.map(_store => _store.name),
          tooltipFormatValue: ChartUtils.tooltipMinuteFormat,
          colors: this.chartsConfig.colorCompares,
          data: [{
            values: _stores.map((_store) => {
              const dataForStore = _charts.find(_chart => _chart.store === _store.id);
              return dataForStore ? dataForStore.value : 0;
            }),
          }]
        };
      });
  }

  getChartDataCustomerVisitAtRushHour(payload): any {
    this._analyticsCustomerService
      .search({ ...payload }, 'customer/quests-in-peak-hour')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
        const _chartType = 'quests_in_peak_hour';
        const _charts = _analyticsData.data;
        const _stores = _analyticsData.stores;
        if (!_stores || !_stores.length) {
          return;
        }
        this.customerVisitAtRushHourChartData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          valueLabels: _stores.map(_store => _store.name),
          colors: this.chartsConfig.colorCompares,
          data: [{
            values: _stores.map((_store) => {
              const dataForStore = _charts.find(_chart => _chart.store === _store.id);
              return dataForStore ? dataForStore.value : 0;
            }),
          }]
        };
      });
  }

  getChartDataSituationCompare(payload): any {
    this._analyticsCustomerService
      .search({ ...payload }, 'customer/situation-compare')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
        const _chartType = 'situation_compare';
        const _stores = _analyticsData.stores;
        const _charts = _analyticsData.data.data;
        const _categories = _analyticsData.data.categories;
        if (!_stores || !_stores.length) {
          return;
        }
        
        this.situationCompareChartData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          valueLabels: _stores.map(_store => _store.name),
          colors: this.chartsConfig.colorCompares,
          data: _categories.map((category, categoryIndex) => ({
            dateTime: category,
            values: _stores.map((_, valueIndex) => _charts[valueIndex].value[categoryIndex])
          })),
        };
      });
  }

  getChartDataCustomVisitByGender(payload): any {
    this._analyticsCustomerService
      .search({ ...payload }, 'customer/rate-by-gender')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
        const _chartType = 'rate_by_gender';
        const _charts = _analyticsData.data;
        const _stores = _analyticsData.stores;
        if (!_stores || !_stores.length) {
          return;
        }
        this.customVisitByGenderChartData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          valueLabels: _stores.map(_store => _store.name),
          colors: this.chartsConfig.colorCompares,
          data: _stores.map((_store) => {
            const dataForStore = _charts.find(_chart => _chart.store === _store.id);
            const _values = [];
            const _valueUnit = [];
            let _total = 0;
            dataForStore.data.forEach((_dataItem) => {
              _total += _dataItem.value;
              _values.push(_dataItem.value);
              _valueUnit.push(_dataItem.gender);
            });
            return {
              values: _values,
              valueUnit: _valueUnit,
              total: _total,
            };
          }),
        };
      });
  }

  getChartDataCustomVisitByAge(payload): any {
    this._analyticsCustomerService
      .search({ ...payload }, 'customer/rate-by-age')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
        const _chartType = 'rate_by_age';
        const _charts = _analyticsData.data;
        const _stores = _analyticsData.stores;
        if (!_stores || !_stores.length) {
          return;
        }
        this.customVisitByAgeChartData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          valueLabels: _stores.map(_store => _store.name),
          colors: this.chartsConfig.colorCompares,
          data: _stores.map((_store) => {
            const dataForStore = _charts.find(_chart => _chart.store === _store.id);
            const _values = [];
            const _valueUnit = [];
            let _total = 0;
            dataForStore.data.forEach((_dataItem) => {
              _total += _dataItem.value;
              _values.push(_dataItem.value);
              _valueUnit.push(_dataItem.age_type);
            });
            return {
              values: _values,
              valueUnit: _valueUnit,
              total: _total,
            };
          }),
        };
      });
  }

  getChartDataNearestAverageByTimes(payload): any {
    this._analyticsCustomerService
      .search({ ...payload }, 'customer/nearest-average-by-times')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
        const _chartType = 'nearest_average_by_times';
        const _charts = _analyticsData.data;
        const _stores = _analyticsData.stores;
        if (!_stores || !_stores.length) {
          return;
        }
        this.nearestAverageByTimesChartData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          valueLabels: _stores.map(_store => _store.name),
          colors: this.chartsConfig.colorCompares,
          data: [{
            values: _stores.map((_store) => {
              const dataForStore = _charts.find(_chart => _chart.store === _store.id);
              return dataForStore ? dataForStore.value : 0;
            }),
          }]
        };
      });
  }

  getChartDataAverageByTimePeriodBack(payload): any {
    this._analyticsCustomerService
      .search({ ...payload }, 'customer/average-by-time-period-back')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
        const _chartType = 'average_by_time_period_back';
        const _charts = _analyticsData.data;
        const _stores = _analyticsData.stores;
        if (!_stores || !_stores.length) {
          return;
        }
        this.averageByTimePeriodBackChartData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          valueLabels: _stores.map(_store => _store.name),
          colors: this.chartsConfig.colorCompares,
          data: [{
            values: _stores.map((_store) => {
              const dataForStore = _charts.find(_chart => _chart.store === _store.id);
              return dataForStore ? dataForStore.value : 0;
            }),
          }]
        };
      });
  }

  getChartDataAverageByTurns(payload): any {
    this._analyticsCustomerService
      .search({ ...payload }, 'customer/average-by-turns')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analyticsData) => {
        const _chartType = 'average_by_turns';
        const _charts = _analyticsData.data;
        const _stores = _analyticsData.stores;
        if (!_stores || !_stores.length) {
          return;
        }
        this.averageByTurnsChartData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          valueLabels: _stores.map(_store => _store.name),
          colors: this.chartsConfig.colorCompares,
          data: [{
            values: _stores.map((_store) => {
              const dataForStore = _charts.find(_chart => _chart.store === _store.id);
              return dataForStore ? dataForStore.value : 0;
            }),
          }]
        };
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
