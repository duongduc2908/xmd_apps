import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MarketingService } from 'app/services/marketing.service';

@Component({
  selector: 'vai-dialog-confirm-remove',
  templateUrl: './dialog-confirm-remove.component.html',
  styleUrls: ['./dialog-confirm-remove.component.scss']
})
export class DialogConfirmRemoveComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private _marketingService: MarketingService,
    public dialogRef: MatDialogRef<DialogConfirmRemoveComponent>
  ) { }

  ngOnInit(): void {
  }


  onRemove(): void {
    this._marketingService.delete(this.data.id).subscribe((_response) => {
      this.dialogRef.close({ event: 'delete', status: _response.status });
    });
  }
}
