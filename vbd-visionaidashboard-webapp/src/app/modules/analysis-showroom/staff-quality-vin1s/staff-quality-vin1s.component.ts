/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnalyticsFilterService, DEFAULT_ANALYTICS_FILTER } from 'app/services/analytics-filter.service';
import { ConfigService } from 'app/services/config.service';
import { AnalyticsShowroomService } from 'app/services/analytics-showroom.service';
import { Subject, takeUntil } from 'rxjs';
import { ChartUtils } from 'app/utils/chart.utils';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'analysis-showroom-staff-quality-vin1s',
  templateUrl: './staff-quality-vin1s.component.html',
  styleUrls: ['./staff-quality-vin1s.component.scss'],
})
export class AnalysisShowroomStaffQualityVin1sComponent implements OnInit, OnDestroy {
  chartsConfig: any;
  rateBeingWelcomedData: any;
  rateBeingWelcomedByAgeData: any;
  rateBeingWelcomedByGenderData: any;
  showroomType = null;
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
      .subscribe(({ isSearch, ..._filterParams }) => {
        if (isSearch) {
          const params = { ..._filterParams, showroomType: this.showroomType };
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
        this.showroomType = _data.showroomType;
        this._analyticsFilter.setFilterParam({
          ...DEFAULT_ANALYTICS_FILTER,
          showroomType: _data.showroomType,
          isSearch: true,
        });
      });
  }

  getChartDataRateBeingWelcomed(payload: any): any {
    this._analyticsShowroomService
      .search({ ...payload }, 'showroom/rate-being-welcomed')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_staffQualityData) => {
        const _chartType = 'rate_being_welcomed';
        const _chart = _staffQualityData.data;
        if (!_chart) {
          return;
        }
        this.rateBeingWelcomedData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          groupData: _chart.map((item, index) => ({
            valueLabels: ['Khách được đón tiếp', 'Tổng số khách'],
            colors: ChartUtils.getChartColorsCompares(this.chartsConfig, index),
            storeName: ChartUtils.getChartsName(
              _staffQualityData.stores,
              item.store
            ),
            data: [
              {
                values: [item.value, item.total],
                rate: [item.rate],
              },
            ],
          })),
        };
      });
  }

  getChartDataRateBeingWelcomedByGender(payload: any): any {
    this._analyticsShowroomService
      .search({ ...payload }, 'showroom/rate-being-welcomed-by-gender')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_staffQualityData) => {
        const _chartType = 'rate_being_welcomed_by_gender';
        const _chart = _staffQualityData.data;
        if (!_chart) {
          return;
        }
        this.rateBeingWelcomedByGenderData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          groupData: _chart.map((item, index) => ({
            colors: ChartUtils.getChartColorsByType(
              this.chartsConfig,
              'gender'
            ),
            valueLabels: item.data.map((label, labelIndex) => label.gender),
            storeName: ChartUtils.getChartsName(
              _staffQualityData.stores,
              item.store
            ),
            data: [
              {
                values: item.data.map((data, dataIndex) => data.value),
              },
            ],
          })),
        };
      });
  }

  getChartDataRateBeingWelcomedByAge(payload: any): any {
    this._analyticsShowroomService
      .search({ ...payload }, 'showroom/rate-being-welcomed-by-age')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_staffQualityData) => {
        const _chartType = 'rate_being_welcomed_by_age';
        const _chart = _staffQualityData.data;
        if (!_chart) {
          return;
        }
        this.rateBeingWelcomedByAgeData = {
          title: ChartUtils.getChartTitleCompare(this.chartsConfig, _chartType),
          groupData: _chart.map((item, index) => ({
            colors: ChartUtils.getChartColorsByType(
              this.chartsConfig,
              'age_types'
            ),
            valueLabels: item.data.map((label, labelIndex) => label.age_type),
            storeName: ChartUtils.getChartsName(
              _staffQualityData.stores,
              item.store
            ),
            data: [
              {
                values: item.data.map((data, dataIndex) => data.value),
              },
            ],
          })),
        };
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
