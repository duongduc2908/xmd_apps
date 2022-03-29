/* eslint-disable @typescript-eslint/naming-convention */
import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from 'app/services/config.service';
import { MarketingService } from 'app/services/marketing.service';
import { AnalyticsFilterService } from 'app/services/analytics-filter.service';
import moment from 'moment';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import * as textMask from 'vanilla-text-mask/dist/vanillaTextMask.js';
import { ReportViewerHelperComponent } from '../../../vai-components/report-viewer-helper/report-viewer-helper.component';
import { CONST } from '../../../../app.constants';


@Component({
  selector: 'vai-form-marketing-report',
  templateUrl: './form-marketing-report.component.html',
  styleUrls: ['./form-marketing-report.component.scss']
})
export class FormMarketingReportComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('inputFromDate', { read: ViewContainerRef }) public inputFromDate;
  @ViewChild('inputToDate', { read: ViewContainerRef }) public inputToDate;
  @ViewChild('fileUpload') fileUpload: HTMLInputElement;
  @ViewChild('inputShowroom') inputShowroom;
  @ViewChild('reportViewerHelper', { static: true })
  reportViewerHelper: ReportViewerHelperComponent;

  marketingReportFrom: FormGroup;
  stores: any;
  fileName = '';
  storeOpenState = false;
  listError = null;
  numberMask = createNumberMask({
    prefix: '',
    suffix: '',
    allowDecimal: true,
    decimalLimit: 10,
  });

  cars = [
    { id: 1, name: "BMW Hyundai" },
    { id: 2, name: "Kia Tata" },
    { id: 3, name: "Volkswagen Ford" },
    { id: 4, name: "Renault Audi" },
    { id: 5, name: "Mercedes Benz Skoda" },
  ];
  
  selected = [{ id: 3, name: "Volkswagen Ford" }];

  
  maskedInputFromController;
  maskedInputToController;
  private file = null;
  private fileAllow = ['xlsx', 'xls'];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _formBuilder: FormBuilder,
    private _configService: ConfigService,
    private _marketingService: MarketingService,
    private _router: Router,
    private _analyticsFilter: AnalyticsFilterService,
    private _dialog: MatDialog,
  ) {
    this.marketingReportFrom = this._formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      stores: [[], [Validators.required]],
      campains: this._formBuilder.array([this.newCampaign()]),
      start_date: [null, [Validators.required]],
      end_date: [null, [Validators.required]],
      data_file: [null]
    });
  }

  get campains(): FormArray {
    return this.marketingReportFrom.get('campains') as FormArray;
  }

  ngOnInit(): void {
    this._configService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_config) => {
        this.stores = _config.stores;
      });
    this._analyticsFilter.setFilterParam({
      showroomType: 'all',
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.maskedInputFromController = textMask.maskInput({
        inputElement: this.inputFromDate.element.nativeElement,
        mask: CONST.DATE_INPUT_FORMAT,
        guide: false,
      });
      this.maskedInputToController = textMask.maskInput({
        inputElement: this.inputToDate.element.nativeElement,
        mask: CONST.DATE_INPUT_FORMAT,
        guide: false,
      });
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this.maskedInputFromController.destroy();
    this.maskedInputToController.destroy();
  }

  maxStartDate(): any {
    if (this.marketingReportFrom.value.end_date) {
      return this.marketingReportFrom.value.end_date;
    }
    return this.maxEndDate();
  }

  minStartDate(): any {
    if (this.marketingReportFrom.value.end_date) {
      return moment(this.marketingReportFrom.value.end_date).subtract(90, 'days');
    }
    return null;
  }

  minEnDate(): any {
    if (this.marketingReportFrom.value.start_date) {
      return this.marketingReportFrom.value.start_date;
    }
    return null;
  }

  maxEndDate(): any {
    return moment();
  }

  onToggleSelectStore(): any {
    this.storeOpenState = !this.storeOpenState;
  }

  newCampaign(): FormGroup {
    return this._formBuilder.group({
      name: ['', Validators.required],
      fee: ['', Validators.required],
    });
  }


  addCampaign(): void {
    this.campains.push(this.newCampaign());
  }

  removeCampaign(index): any {
    this.campains.removeAt(index);
  }

  openFile(event): void {
    event.click();
  }

  onChangeFile(event): void {
    const field = this.marketingReportFrom.get('data_file');
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
      this.fileName = this.file.name;
      const fileType = this.file.name.split('.');
      const isExcelFile = this.fileAllow.includes(fileType[1]);
      if (!isExcelFile) {
        field.setErrors({ 'inValid': true });
      }
      return;
    }
    field.setErrors({ 'custom-required': true });
    this.file = null;
    this.fileName = null;
  }

  isAddCampaign(): boolean {
    const campains = this.marketingReportFrom.get('campain').value;
    return campains.some(_val => _val.name === '');
  }

  isReviewActive(): boolean {
    return this.marketingReportFrom.invalid;
  }

  selectStore(storeId): any {
    let store = this.marketingReportFrom.value['stores'] || [];
    const storeIsActive = store.find(_itm => _itm === storeId);
    if (storeIsActive) {
      store = store.filter(_itm => _itm !== storeId);
      this.setShowroom(store);
      return;
    }
    store.push(storeId);
    this.setShowroom(store);
  }

  getStoreName(): any {
    const name = [];
    const store = this.marketingReportFrom.value['stores'];
    if (!store) {
      return '';
    }
    store.forEach((_id) => {
      const _store = this.stores.find(_itm => _itm.id === _id);
      if (_store) {
        name.push(_store.name);
      }
    });
    return name.join();
  }

  isChecked(storeId): boolean {
    const store = this.marketingReportFrom.value['stores'] || [];
    return store.includes(storeId);
  }

  resetForm(): void {
    this.marketingReportFrom.reset();
    this.file = null;
    this.fileName = '';
    this._router.navigate(['analysis-customer/marketing-report']);
  }

  dayCalculator(): any {
    const today = moment().unix();
    const startDate = this.marketingReportFrom.get('start_date');
    const endDate = this.marketingReportFrom.get('end_date');
    if (today < startDate.value.unix() || today < endDate.value.unix()) {
      return 'Thời gian lấy dữ liệu là bất kỳ nhưng không được vượt quá ngày hôm nay';
    }
    const days = endDate?.value.diff(startDate.value, 'days');
    if (days > 90) {
      return 'Thời gian lấy dữ liệu là bất kỳ nhưng không được vượt quá 90 ngày';
    }
    if (startDate.value.unix() > endDate.value.unix()) {
      return 'Từ ngày không được vượt quá đến ngày';
    }
  }

  convertCampaign(campaigns: Array<any>): Array<any> {
    if (!campaigns) { return []; }
    return campaigns
      .filter(_item => _item.name !== '' && _item.fee);
  }

  onSubmit(): void {
    const formData = this.getFormData('');
    if (formData) {
      this._marketingService.save(formData)
        .subscribe((_response) => {
          if (_response.status === 'SUCCESS') {
            this.reportViewerHelper
              .exportPDF(_response.data)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe(() => this._router.navigate(['analysis-customer/marketing-report']));
          } else {
            this.listError = _response.data;
            Object.keys(_response.data).forEach((_key) => {
              this.marketingReportFrom.get(_key).setErrors({ 'serverError': true });
            });
            this.marketingReportFrom.markAllAsTouched();
          }
        });
    }
  }

  onPreview(): void {
    const formData = this.getFormData('True');
    if (formData) {
      this._marketingService
        .save(formData)
        .subscribe((_response) => {
          if (_response && _response.status === 'SUCCESS') {
            const reportViewer = this.reportViewerHelper.openReportViewer(_response.data, true);
            reportViewer.saveClick
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe(() => {
                this.reportViewerHelper.dialogRef.close();
                this.onPreviewSave();
              });
          }
        })
        ;
    }
  }

  onPreviewSave(): void {
    const formData = this.getFormData('');
    this._marketingService.save(formData)
      .subscribe((_response) => {
        if (_response.status === 'SUCCESS') {
          this.reportViewerHelper
            .exportPDF(_response.data)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => this._router.navigate(['analysis-customer/marketing-report']));
        }
      });
  }

  private getFormData(unsave): any {
    if (this.marketingReportFrom.invalid) {
      const field = this.marketingReportFrom.get('data_file');
      if (!field.value) {
        field.setErrors({ 'custom-required': true });
      }
      this.marketingReportFrom.markAllAsTouched();
      return null;
    }
    const value = cloneDeep(this.marketingReportFrom.value);
    const payload = {
      ...value,
      campains: this.convertCampaign(value.campains),
      start_date: value.start_date ? moment(value.start_date).format('MM/DD/YYYY') : null,
      end_date: value.end_date ? moment(value.end_date).format('MM/DD/YYYY') : null,
      unsave
    };
    const formData = new FormData();
    Object.keys(payload).forEach((_key) => {
      if (_key === 'data_file') {
        formData.append(_key, this.file);
      } else if (Array.isArray(payload[_key])) {
        formData.append(_key, JSON.stringify(payload[_key]));
      }
      else {
        formData.append(_key, payload[_key]);
      }
    });
    return formData;
  }

  private setShowroom(value): any {
    this.marketingReportFrom.get('stores').setValue(value);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @HostListener('document:click', ['$event'])
  documentClick(event): void {
    if (!this.inputShowroom.nativeElement.contains(event.target)) {
      this.storeOpenState = false;
    }
  }
}
