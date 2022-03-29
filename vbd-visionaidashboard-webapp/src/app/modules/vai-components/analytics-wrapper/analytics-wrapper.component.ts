import { Component, Input, OnInit } from '@angular/core';
import { AnalyticsFilterService } from '../../../services/analytics-filter.service';

@Component({
  selector: 'vai-analytics-wrapper',
  templateUrl: './analytics-wrapper.component.html',
  styleUrls: ['./analytics-wrapper.component.scss']
})
export class AnalyticsWrapperComponent implements OnInit {
  @Input() title = '';
  showFiller = false;
  constructor(private _analyticsFilterService: AnalyticsFilterService) {
    this._analyticsFilterService.isOpenFilter$.subscribe(_isOpen => this.showFiller = _isOpen);
  }

  ngOnInit(): void {
  }

  openDrawer(): void {
    this._analyticsFilterService.isOpenFilter = true;
  }

}
