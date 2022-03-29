export class ChartUtils {
  constructor() {
  }

  static getChartTitle(chartConfig: any, chartType: string): string {
    if (!chartConfig || !chartConfig.charts) { return ''; }
    return chartConfig.charts[chartType]?.title || '';
  }

  static getChartTitleCompare(chartConfig: any, chartType: string): string {
    if (!chartConfig || !chartConfig.charts) { return ''; }
    return chartConfig.charts[chartType]?.title_compare || '';
  }

  static getChartTooltip(chartConfig: any, chartType: string): string {
    if (!chartConfig || !chartConfig.charts) { return ''; }
    return chartConfig.charts[chartType]?.tooltip || '';
  }

  static getChartColorsByType(chartConfig: any, type: string): Array<string> {
    if (!chartConfig || !chartConfig[type]) { return []; }
    return chartConfig[type].map(item => item.color);
  }

  static getChartColorsCompares(chartConfig: any, position: number): Array<string> {
    if (!chartConfig) { return []; }
    const colors = [];
    colors.push(chartConfig['color_compares'][position]);
    return colors;
  }

  static getChartsName(chartData: Array<any>, id: number): string {
    if (!chartData && !id) { return ''; }
    const store = chartData.find(_store => _store.id === id);
    return store ? store.name : '';
  }

  static tooltipMinuteFormat(minute: number): string {
    return `${minute} phút`;
  }
}
