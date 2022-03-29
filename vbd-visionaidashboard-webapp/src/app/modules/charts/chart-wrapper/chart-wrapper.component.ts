import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'vai-chart-wrapper',
  templateUrl: './chart-wrapper.component.html',
  styleUrls: ['./chart-wrapper.component.scss'],
})
export class ChartWrapperComponent implements OnInit {
  @Input() title = '';
  @Input() tooltip = null;
  constructor() {}

  ngOnInit(): void {}
}
