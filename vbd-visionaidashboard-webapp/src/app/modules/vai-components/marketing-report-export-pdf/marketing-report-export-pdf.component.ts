/* eslint-disable @typescript-eslint/naming-convention,@typescript-eslint/member-ordering */
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ConfigService } from '../../../services/config.service';
import { jsPDF } from 'jspdf';
import * as html2canvas from 'html2canvas';
import moment from 'moment';
import { Observable } from 'rxjs';


@Component({
  selector: 'vai-marketing-report-export-pdf',
  templateUrl: './marketing-report-export-pdf.component.html',
  styleUrls: ['./marketing-report-export-pdf.component.scss']
})
export class MarketingReportExportPdfComponent implements OnInit, OnChanges {
  @Input() reportData = null;
  @Output() saveClick = new EventEmitter();
  @Output() closeClick = new EventEmitter();
  @ViewChild('pdfScreen') pdfScreen: ElementRef;
  reportInfo;
  campaignChartData;
  summaryChartData;
  campaignPerformanceChartData;
  orderFootfallChartData;
  orderFootfallSplitPageChartData;
  localIsSave;

  @Input() set isSave(value: boolean) {
    this.localIsSave = value;
  };
  private CHART_PER_PAGE = 4;
  private SUMMARY_CHART_NAME = {
    total_order: 'Tổng số lượng đơn hàng',
    total_visits: 'Tổng lượt ghé thăm',
    average_visit_time: 'Thời gian ghé thăm trung bình',
    order_conversion_rate: 'Tỉ lệ chuyển đổi đơn hàng',
  };
  private stores = [];

  constructor(private _configService: ConfigService) {
    this._configService.config$.subscribe((config) => {
      this.stores = config.stores;
    });
  }

  getPagesByChartData(chartData): any[] {
    if (!chartData ||  chartData.length < 2) {return [];}
    const chartClone = chartData.slice(1, chartData.length);
    const result = [];
    for (let i = 0; i < chartClone.length; i += this.CHART_PER_PAGE) {
      result.push(chartClone.slice(i, i + this.CHART_PER_PAGE));
    }
    return result;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('reportData' in changes) {
      const reportData = changes.reportData.currentValue;
      if (!reportData) {return;}
      this.convertReportData(reportData);
    }
  }

  convertReportData({result, ...other}, isSave = false): void {
    this.getReportInfo(other, result);
    this.getChartDataCampaign(result);
    this.getChartDataSummary(result);
    this.getChartDataCampaignPerformance(result);
    this.getChartDataOrderFootfall(result);
    this.localIsSave = isSave;
  }

  getStoreById(storeId): string {
    if (!storeId || !this.stores || !this.stores.length) {return '';}
    const store = this.stores.find(item => item.id === storeId);
    return store ? store.name : '';
  }

  getReportInfo(report, result): void {
    const {start_time, end_time} = report;
    const startTime = moment(start_time, 'YYYY-MM-DD');
    const endTime = moment(end_time, 'YYYY-MM-DD');
    const {detail_by_store: {order_conversion_rate}, overview: {same_period}} = result;
    this.reportInfo = {
      name: report.name,
      startTime: startTime.format('DD-MM-YYYY'),
      endTime: endTime.format('DD-MM-YYYY'),
      stores: order_conversion_rate.map(item=> this.getStoreById(item.store)).join(', ')
    };
  }

  getChartDataCampaign({overview}): void {
    if (!overview) { return; }
    const _valueLabels = [];
    const _values = [];
    const _valueUnit = [];
    overview.marketing_total_cost.forEach((item) => {
      _valueLabels.push(item.campain);
      _values.push(item.value);
      _valueUnit.push(item.value_unit);
    });
    this.campaignChartData = {
      colors: ['#7C2EFB','#AC84FA','#B63BA9'],
      valueLabels: _valueLabels,
      data: [{
        values: _values,
        valueUnit: _valueUnit,
      }]
    };
  }

  getChartDataSummary({overview}): void {
    if (!overview) { return; }
    const getValue = (type): any => ({
      ...overview[type],
      name: this.SUMMARY_CHART_NAME[type],
      valueUnit: overview[type].value_unit,
      change: overview[type].value_change,
      changeType: overview[type].value_change_type,
      changeUnit: overview[type].value_change_unit,
      period: overview.same_period,
    });
    this.summaryChartData = [
      'total_visits',
      'average_visit_time',
      'total_order',
      'order_conversion_rate',
    ].map(type => getValue(type));
  }

  getChartDataCampaignPerformance({detail_by_store}): void {
    if (!detail_by_store) { return; }
    const {order_conversion_rate, orders, visits} = detail_by_store;
    this.campaignPerformanceChartData = {
      valueLabels: order_conversion_rate.map(item=> this.getStoreById(item.store)),
      data: order_conversion_rate.map((_, index)=> ({
        order: orders[index].value,
        visit: visits[index].value,
        conversionRate: order_conversion_rate[index].value
      })),
    };
  }

  getChartDataOrderFootfall({detail_by_store}): void {
    if (!detail_by_store) { return; }
    const {situations} = detail_by_store;
    const stores = situations.map(item=> ({
      name: this.getStoreById(item.store),
      id: item.store,
    }));
    this.orderFootfallChartData = stores.map((store) => {
      const situation = situations.find(item => item.store === store.id);
      return {
        title: `Diễn biến số lượng đơn hàng so với footfall theo thời gian tại ${store.name}`,
        valueLabels: ['Đơn hàng', 'Footfall'],
        data: situation.categories.map((category, index) => ({
          dateTime: category,
          values: [situation.data[0].value[index], situation.data[1].value[index]],
        }))
      };
    });
    this.orderFootfallSplitPageChartData = this.getPagesByChartData(this.orderFootfallChartData);
  };

  exportPDF(): Observable<any> {
    return new Observable((_observable) => {
      const pagesElm = this.pdfScreen.nativeElement.getElementsByClassName('jspdf-page');
      const pages = Array.from(pagesElm);
      const allPage = Promise.all(pages.map(page => html2canvas(page, {logging: false})));
      allPage.then((canvases) => {
        const pdf = new jsPDF('p', 'px', 'a4');
        canvases.forEach((canvas, index) => {
          const imgData = canvas.toDataURL('image/png');
          const {width, height} = canvas;
          const [pageWidth, pageHeight] = [pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight()];
          const newWidth = width * pageHeight / height;
          if (newWidth <= pageWidth) {
            pdf.addImage(imgData, 'PNG', newWidth < pageWidth ? (pageWidth - newWidth) / 2 : 0, 0, newWidth, pageHeight);
          } else {
            pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageWidth * height / width);
          }
          if (index < canvases.length - 1) {
            pdf.addPage();
          }
        });
        pdf.save(`vision_report_${new Date().getTime()}.pdf`);
        _observable.next(true);
        _observable.complete();
      });
    });
  }

  onSaveAndExport(): void {
    this.saveClick.emit();
  }

  onClose(): void {
    this.closeClick.emit();
  }
}
