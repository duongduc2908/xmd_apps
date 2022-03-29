import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalcPercentPipe } from './calc-percent.pipe';
import { NumberWithCommaPipe } from './number-with-comma.pipe';



@NgModule({
  declarations: [
    CalcPercentPipe,
    NumberWithCommaPipe
  ],
  exports: [
    CalcPercentPipe,
    NumberWithCommaPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
