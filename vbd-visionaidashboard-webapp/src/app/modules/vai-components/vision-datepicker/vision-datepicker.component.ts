import { Component, forwardRef, Input, OnInit, Provider } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const DATEPICKER_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => VisionDatepickerComponent),
  multi: true,
};


@Component({
  selector: 'vai-vision-datepicker',
  templateUrl: './vision-datepicker.component.html',
  styleUrls: ['./vision-datepicker.component.scss'],
  providers: [DATEPICKER_CONTROL_VALUE_ACCESSOR],
})
export class VisionDatepickerComponent implements ControlValueAccessor {
  @Input() min;
  @Input() max;
  constructor() { }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(obj: any): void {
  }

}
