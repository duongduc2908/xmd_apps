import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { MarketingReportExportPdfComponent } from '../marketing-report-export-pdf/marketing-report-export-pdf.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vai-report-viewer-helper',
  templateUrl: './report-viewer-helper.component.html',
  styleUrls: ['./report-viewer-helper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ReportViewerHelperComponent implements OnInit {
  @ViewChild('reportExportPdfComponent', {static: true})
  reportExportPdfComponent: MarketingReportExportPdfComponent;

  reportSelected;
  private _dialogRef;

  constructor(private _dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get dialogRef(): MatDialogRef<any> {
    return this._dialogRef;
  };

  exportPDF(reportData): Observable<any> {
    return new Observable((_observable) => {
      this.reportSelected = reportData;
      setTimeout(() => this.reportExportPdfComponent
        .exportPDF().subscribe((res) => {
          _observable.next(res);
          _observable.complete();
        }), 1000);
    });
  }

  openReportViewer(reportData, isSave = false): any {
    this._dialogRef = this._dialog.open(MarketingReportExportPdfComponent, {
      panelClass: 'vision-report-dialog',
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%'
    });
    const reportInstance = this._dialogRef.componentInstance;
    reportInstance.convertReportData(reportData, isSave);
    return {
      afterClosed: this._dialogRef.afterClosed(),
      saveClick: reportInstance.saveClick,
      closeClick: reportInstance.closeClick,
    };
  }
}
