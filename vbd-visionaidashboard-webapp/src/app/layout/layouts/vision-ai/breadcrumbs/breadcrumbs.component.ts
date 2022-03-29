import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { BreadcrumbsService } from './breadcrumbs.service';


@Component({
  selector: 'vai-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs = [];
  constructor(private _breadcrumbsService: BreadcrumbsService) {
    _breadcrumbsService.breadcrumbs$.subscribe((res) => {
      this.breadcrumbs = res;
    });
  }

  ngOnInit(): void {
  }

}
