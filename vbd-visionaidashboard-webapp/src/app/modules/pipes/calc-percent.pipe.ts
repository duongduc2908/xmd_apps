import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calcPercent'
})
export class CalcPercentPipe implements PipeTransform {

  transform(value: number, total: number): string {
    if (!total) {return '%';}
    return Math.round(value / total * 100) + '%';
  }

}
