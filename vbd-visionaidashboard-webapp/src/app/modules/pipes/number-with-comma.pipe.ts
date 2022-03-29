import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({
  name: 'numberWithComma'
})
export class NumberWithCommaPipe implements PipeTransform {

  transform(num: number): unknown {
    return formatNumber(num, 'en-US', '1.0');
  }

}
