import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'vai-chart-wrapper-compare',
  templateUrl: './chart-wrapper-compare.component.html',
  styleUrls: ['./chart-wrapper-compare.component.scss']
})
export class ChartWrapperCompareComponent implements OnInit {

  @Input() itemCount = 0;
  constructor() { }

  ngOnInit(): void {
  }

}
