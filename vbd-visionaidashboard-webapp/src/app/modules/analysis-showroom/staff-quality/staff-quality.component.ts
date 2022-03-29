import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnalyticsShowroomService } from 'app/services/analytics-showroom.service';
import {
  AnalyticsFilterService,
  DEFAULT_ANALYTICS_FILTER,
} from 'app/services/analytics-filter.service';
import { ConfigService } from 'app/services/config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartUtils } from 'app/utils/chart.utils';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'analysis-showroom-staff-quality',
  templateUrl: './staff-quality.component.html',
  styleUrls: ['./staff-quality.component.scss'],
})
export class AnalysisShowroomStaffQualityComponent implements OnInit, OnDestroy {
  chartsConfig: any;
  rateBeingWelcomedData: any;
  rateBeingWelcomedByAgeData: any;
  rateBeingWelcomedByGenderData: any;
  chartsData: any;
  storeSelectedIndex = 0;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _analyticsFilter: AnalyticsFilterService,
    private _configService: ConfigService,
    private _analyticsShowroomService: AnalyticsShowroomService,
    private _route: ActivatedRoute
  ) {
    this._configService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_config) => {
        this.chartsConfig = _config;
      });

    this._analyticsFilter.filterParams$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ isSearch, ...params }) => {
        if (isSearch) {
          this.getChartDataRateBeingWelcomed(params);
          this.getChartDataRateBeingWelcomedByGender(params);
          this.getChartDataRateBeingWelcomedByAge(params);
        }
      });
  }

  ngOnInit(): void {
    this._route.data
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_data) => {
        this._analyticsFilter.setFilterParam({
          ...DEFAULT_ANALYTICS_FILTER,
          showroomType: null,
          isSearch: true,
        });
      });
  }

  getChartDataRateBeingWelcomed(payload: any): any {
    this._analyticsShowroomService
      .search({ ...payload }, 'showroom/rate-being-welcomed')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analysisData) => {
        const _chartType = 'rate_being_welcomed';
        const _chart = _analysisData.data[this.storeSelectedIndex];
        if (!_chart) {
          return;
        }
        this.rateBeingWelcomedData = {
          title: ChartUtils.getChartTitle(this.chartsConfig, _chartType),
          colors: ChartUtils.getChartColorsCompares(
            this.chartsConfig,
            this.storeSelectedIndex
          ),
          valueLabels: ['Khách được đón tiếp', 'Tổng số khách'],
          data: [
            {
              values: [_chart.value, _chart.total],
              rate: [_chart.rate],
            },
          ],
        };
      });
  }

  getChartDataRateBeingWelcomedByGender(payload: any): any {
    this._analyticsShowroomService
      .search({ ...payload }, 'showroom/rate-being-welcomed-by-gender')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analysisData) => {
        const _chartType = 'rate_being_welcomed_by_gender';
        const _chart = _analysisData.data[this.storeSelectedIndex];
        if (!_chart) {
          return;
        }
        this.rateBeingWelcomedByGenderData = {
          title: ChartUtils.getChartTitle(this.chartsConfig, _chartType),
          colors: ChartUtils.getChartColorsByType(this.chartsConfig, 'gender'),
          valueLabels: _chart.data.map((item, index) => item.gender),
          data: [
            {
              values: _chart.data.map((item, valueIndex) => item.value),
            },
          ],
        };
      });
  }

  getChartDataRateBeingWelcomedByAge(payload: any): any {
    this._analyticsShowroomService
      .search({ ...payload }, 'showroom/rate-being-welcomed-by-age')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_analysisData) => {
        const _chartType = 'rate_being_welcomed_by_age';
        const _chart = _analysisData.data[this.storeSelectedIndex];
        if (!_chart) {
          return;
        }
        this.rateBeingWelcomedByAgeData = {
          title: ChartUtils.getChartTitle(this.chartsConfig, _chartType),
          colors: ChartUtils.getChartColorsByType(this.chartsConfig, 'age_types'),
          valueLabels: _chart.data.map((item, index) => item.age_type),
          data: [
            {
              values: _chart.data.map((item, valueIndex) => item.value),
            },
          ],
        };
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
