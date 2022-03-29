import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { ChartWrapperComponent } from './chart-wrapper/chart-wrapper.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { SummaryChartComponent } from './summary-chart/summary-chart.component';
import { CircleWaveChartComponent } from './circle-wave-chart/circle-wave-chart.component';
import { ChartWrapperCompareComponent } from './chart-wrapper-compare/chart-wrapper-compare.component';
import { PieCampaignChartComponent } from './pie-campaign-chart/pie-campaign-chart.component';
import { LineStackedAreChartComponent } from './line-stacked-are-chart/line-stacked-are-chart.component';
import { LineBarGroupedChartComponent } from './line-bar-grouped-chart/line-bar-grouped-chart.component';
import { LineAreaChartComponent } from './line-area-chart/line-area-chart.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { FuseCardModule } from '@fuse/components/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PipesModule } from '../pipes/pipes.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

// Echarts
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';
import { SVGRenderer, CanvasRenderer } from 'echarts/renderers';
import 'echarts/theme/macarons.js';
import { BarStackedVerticalChartComponent } from './bar-stacked-vertical-chart/bar-stacked-vertical-chart.component';
import { BarGroupStackedChartComponent } from './bar-group-stacked-chart/bar-group-stacked-chart.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
echarts.use([TitleComponent, TooltipComponent, GridComponent, BarChart, SVGRenderer, CanvasRenderer]);

@NgModule({
  declarations: [
    PieChartComponent,
    ChartWrapperComponent,
    BarChartComponent,
    BarStackedVerticalChartComponent,
    SummaryChartComponent,
    CircleWaveChartComponent,
    ChartWrapperCompareComponent,
    PieCampaignChartComponent,
    LineStackedAreChartComponent,
    LineBarGroupedChartComponent,
    LineAreaChartComponent,
    LineChartComponent,
    BarGroupStackedChartComponent,
    BarGroupStackedChartComponent
  ],
  exports: [
    PieChartComponent,
    ChartWrapperComponent,
    BarChartComponent,
    BarStackedVerticalChartComponent,
    SummaryChartComponent,
    CircleWaveChartComponent,
    ChartWrapperCompareComponent,
    LineStackedAreChartComponent,
    PieCampaignChartComponent,
    LineChartComponent,
    LineBarGroupedChartComponent,
    LineAreaChartComponent,
    BarGroupStackedChartComponent,
  ],
  imports: [
    CommonModule,
    MatTooltipModule,
    NgxEchartsModule.forRoot({echarts}),
    FuseCardModule,
    PipesModule,
    PerfectScrollbarModule,
    MatIconModule,
    MatButtonModule
  ],

})
export class ChartsModule { }
