import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'logs-customer-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.scss'],
  // providers: [
  //   {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {disableClose: true}}
  // ]
})
export class ImageDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data  ) { 
      // this.dialogRef.disableClose = true
    }

  ngOnInit(): void {
  }

}
