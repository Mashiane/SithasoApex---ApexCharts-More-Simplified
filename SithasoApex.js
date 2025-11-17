// ApexCharts should be loaded globally via CDN
// <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

class SithasoApex extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'data', 'options', 'height', 'width', 'theme', 'loading', 'show-legend', 'legend-position', 'show-toolbar', 'title', 'show-data-labels', 'x-axis-title', 'y-axis-title', 'bar-orientation', 'curve', 'line-width', 'categories', 'donut-show-total', 'hollow-size', 'dashed-radial', 'track-width', 'bar', 'x-axis-offsety', 'x-axis-label-rotate', 'x-axis-label-rotate-offsety', 'gradient', 'realtime', 'marker-size'];
  }

  constructor() {
    super();
    this.chart = null;
    this._data = null;
    this._options = {};
    this._isLoading = false;
  }

  connectedCallback() {
    this.checkApexCharts();
    this.render();
  }

  disconnectedCallback() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'loading') {
        this._isLoading = newValue !== null;
        this.updateLoadingState();
      } else if (name === 'type' && this.chart) {
        // Type change requires chart recreation
        this.chart.destroy();
        this.chart = null;
        this.render();
      }
      // All other attribute changes are locked - no chart updates allowed
    }
  }

  checkApexCharts() {
    if (typeof ApexCharts === 'undefined') {
      console.error('ApexCharts is not loaded. Please include: <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>');
      this.showError('ApexCharts library not found. Please load ApexCharts first.');
      return false;
    }
    return true;
  }

  showError(message) {
    this.innerHTML = `<div style="color: red; padding: 20px; text-align: center; border: 1px solid #ffcccc; background: #fff5f5;">${message}</div>`;
  }

  updateLoadingState() {
    if (this._isLoading) {
      this.style.opacity = '0.6';
      this.style.pointerEvents = 'none';
    } else {
      this.style.opacity = '1';
      this.style.pointerEvents = 'auto';
    }
  }

  render() {
    if (!this.checkApexCharts()) return;

    const container = document.createElement('div');
    container.style.height = this.getAttribute('height') || '300px';
    container.style.width = this.getAttribute('width') || '100%';
    container.style.transition = 'opacity 0.3s ease';
    // For circular charts, allow overflow to prevent clipping
    const chartType = this.mapChartType(this.getAttribute('type') || 'line');
    if (chartType === 'pie' || chartType === 'donut' || chartType === 'radialBar') {
      container.style.overflow = 'visible';
    } else {
      container.style.overflow = 'hidden';
    }
    container.style.position = 'relative'; // For proper positioning
    this.appendChild(container);

    this.createChart(container);
    this.updateLoadingState();
  }

  createChart(container) {
    const type = this.getAttribute('type') || 'line';
    const chartType = this.mapChartType(type);

    // Route to specific chart creation method
    switch (chartType) {
      case 'line':
        this.createLineChart(container);
        break;
      case 'area':
        this.createAreaChart(container);
        break;
      case 'column':
        this.createColumnChart(container);
        break;
      case 'bar':
        this.createBarChart(container);
        break;
      case 'pie':
        this.createPieChart(container);
        break;
      case 'donut':
        this.createDonutChart(container);
        break;
      case 'radialBar':
        this.createRadialBarChart(container);
        break;
      case 'polarArea':
        this.createPolarAreaChart(container);
        break;
      case 'radar':
        this.createRadarChart(container);
        break;
      case 'scatter':
        this.createScatterChart(container);
        break;
      default:
        // For unsupported chart types, show error
        this.showError(`Chart type "${type}" is not supported yet`);
        return;
    }
  }

  // ===== UTILITY METHODS =====

  validateChartData(data) {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      this.showError('No data provided for chart');
      return false;
    }
    // Allow empty arrays as they might be valid for dynamic charts
    return true;
  }

  // Get base default options applicable to all chart types
  getBaseDefaultOptions(chartType = 'line') {
    const isCartesian = ['line', 'area', 'bar', 'scatter'].includes(chartType);
    const isCircular = ['pie', 'donut', 'radialBar'].includes(chartType);

    const baseOptions = {
      chart: {
        height: 350,                    // Standard height from examples
        toolbar: { show: true },        // Show toolbar by default, can be disabled via attribute
        animations: { enabled: true },  // Smooth UX
        fontFamily: 'inherit',          // Consistent with page fonts
        zoom: { enabled: false }        // Disabled by default
      },
      dataLabels: {
        enabled: false  // Most examples disable data labels by default
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { height: 250 },       // Smaller height on mobile
          legend: {
            position: 'bottom',          // Legend moves to bottom on mobile
            horizontalAlign: 'center',
            verticalAlign: 'bottom',
            offsetX: 0,
            offsetY: 0
          }
        }
      }],
      tooltip: {
        enabled: true,
        theme: 'light',
        style: { fontSize: '12px' }
      }
    };

    // Add grid settings for all charts
    baseOptions.grid = {
      show: true,
      borderColor: '#e7e7e7',
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: {
        top: 10, right: 20, bottom: 5, left: 10
      }
    };

    return baseOptions;
  }

  // Setter to update chart options dynamically
  set options(newOptions) {
    this._options = { ...this._options, ...newOptions };
    if (this.chart) {
      this.chart.updateOptions(this._options);
    }
  }

  // Getter to retrieve current options
  get options() {
    const attr = this.getAttribute('options');
    if (attr) {
      return this.parseOptions(attr);
    }
    return this._options;
  }

  // Getter for marker-size attribute
  get markerSize() {
    const value = this.getAttribute('marker-size');
    return value ? parseInt(value, 10) : 6;
  }

  // Getters and setters for all observedAttributes
  get typeOf() { return this.getAttribute('type'); }
  set typeOf(value) { this.setAttribute('type', value); }

  get data() { return this.parseData(this.getAttribute('data')); }
  set data(value) { this.setAttribute('data', JSON.stringify(value)); }

  get height() { return this.getAttribute('height'); }
  set height(value) { this.setAttribute('height', value); }

  get width() { return this.getAttribute('width'); }
  set width(value) { this.setAttribute('width', value); }

  get theme() { return this.getAttribute('theme'); }
  set theme(value) { this.setAttribute('theme', value); }

  get loading() { return this.getAttribute('loading'); }
  set loading(value) { this.setAttribute('loading', value); }

  get showLegend() { return this.getAttribute('show-legend'); }
  set showLegend(value) { this.setAttribute('show-legend', value); }

  get legendPosition() { return this.getAttribute('legend-position'); }
  set legendPosition(value) { this.setAttribute('legend-position', value); }

  get showToolbar() { return this.getAttribute('show-toolbar'); }
  set showToolbar(value) { this.setAttribute('show-toolbar', value); }

  get title() { return this.getAttribute('title'); }
  set title(value) { this.setAttribute('title', value); }

  get showDataLabels() { return this.getAttribute('show-data-labels'); }
  set showDataLabels(value) { this.setAttribute('show-data-labels', value); }

  get xAxisTitle() { return this.getAttribute('x-axis-title'); }
  set xAxisTitle(value) { this.setAttribute('x-axis-title', value); }

  get yAxisTitle() { return this.getAttribute('y-axis-title'); }
  set yAxisTitle(value) { this.setAttribute('y-axis-title', value); }

  get barOrientation() { return this.getAttribute('bar-orientation'); }
  set barOrientation(value) { this.setAttribute('bar-orientation', value); }

  get curve() { return this.getAttribute('curve'); }
  set curve(value) { this.setAttribute('curve', value); }

  get lineWidth() { return this.getAttribute('line-width'); }
  set lineWidth(value) { this.setAttribute('line-width', value); }

  get categories() { 
    const value = this.getAttribute('categories');
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }
  set categories(value) { 
    this.setAttribute('categories', JSON.stringify(value)); 
  }

  get donutShowTotal() { return this.getAttribute('donut-show-total'); }
  set donutShowTotal(value) { this.setAttribute('donut-show-total', value); }

  get hollowSize() { return this.getAttribute('hollow-size'); }
  set hollowSize(value) { this.setAttribute('hollow-size', value); }

  get dashedRadial() { return this.getAttribute('dashed-radial'); }
  set dashedRadial(value) { this.setAttribute('dashed-radial', value); }

  get trackWidth() { return this.getAttribute('track-width'); }
  set trackWidth(value) { this.setAttribute('track-width', value); }

  get bar() { return this.getAttribute('bar'); }
  set bar(value) { this.setAttribute('bar', value); }

  get xAxisOffsetY() { return this.getAttribute('x-axis-offsety'); }
  set xAxisOffsetY(value) { this.setAttribute('x-axis-offsety', value); }

  get xAxisLabelRotate() { return this.getAttribute('x-axis-label-rotate'); }
  set xAxisLabelRotate(value) { this.setAttribute('x-axis-label-rotate', value); }

  get xAxisLabelRotateOffsetY() { return this.getAttribute('x-axis-label-rotate-offsety'); }
  set xAxisLabelRotateOffsetY(value) { this.setAttribute('x-axis-label-rotate-offsety', value); }

  get gradient() { return this.getAttribute('gradient'); }
  set gradient(value) { this.setAttribute('gradient', value); }

  get realtime() { return this.getAttribute('realtime'); }
  set realtime(value) { this.setAttribute('realtime', value); }

  // ===== UTILITY METHODS =====

  validateChartData(data) {
    if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
      this.showError('No data provided for chart');
      return false;
    }
    return true;
  }

  formatLineSeries(data) {
    return this.formatGenericSeries(data, 'line');
  }

  formatAreaSeries(data) {
    return this.formatGenericSeries(data, 'area');
  }

  formatBarSeries(data) {
    return this.formatGenericSeries(data, 'bar');
  }

  formatPieSeries(data) {
    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === 'object' && data[0].name) {
        // New format: [{"name": "Desktop", "data": 44, "color": "#008FFB"}]
        return data.map(item => item.data);
      } else if (Array.isArray(data[0]) && data[0].length === 2) {
        // Old format: [["Desktop", 44], ["Mobile", 23]]
        return data.map(item => item[1]);
      } else {
        return data;
      }
    } else if (typeof data === 'object') {
      return Object.values(data);
    }
    return [];
  }

  formatDonutSeries(data) {
    return this.formatPieSeries(data); // Same as pie
  }

  formatRadialBarSeries(data) {
    return this.formatPieSeries(data); // Same as pie
  }

  formatScatterSeries(data) {
    return this.formatGenericSeries(data, 'scatter');
  }

  formatGenericSeries(data, chartType) {
    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === 'object' && data[0].name) {
        // Multiple series: [{"name": "Series 1", "data": [1, 2, 3], "color": "#008FFB"}] or [{"name": "Series 1", "data": {"Jan": 1, "Feb": 2}}]
        return data.map(series => ({
          name: series.name,
          data: this.formatSingleSeries(series.data, chartType),
          color: series.color,
          dashed: series.dashed || false
        }));
      } else {
        // Single series array: [[x, y], [x, y]] or [value, value]
        return [{
          name: 'Series 1',
          data: this.formatSingleSeries(data, chartType)
        }];
      }
    } else if (typeof data === 'object') {
      // Single series object: {"Jan": 100, "Feb": 120}
      return [{
        name: 'Series 1',
        data: this.formatSingleSeries(data, chartType)
      }];
    }
    return [];
  }

  // ===== INDIVIDUAL CHART CREATION METHODS =====

  createLineChart(container) {
    const data = this.parseData(this.getAttribute('data'));
    const options = this.parseOptions(this.getAttribute('options'));

    if (!this.validateChartData(data)) return;

    const series = this.formatLineSeries(data);
    const showLegend = (this.getAttribute('show-legend') !== 'false') && (series.length > 1);
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.getAttribute('show-data-labels') === 'true';
    const xAxisTitle = this.getAttribute('x-axis-title') || '';
    const yAxisTitle = this.getAttribute('y-axis-title') || '';
    const curve = this.getAttribute('curve') || 'smooth';
    const lineWidth = parseInt(this.getAttribute('line-width')) || 3;
    const categories = this.getAttribute('categories') || '[]';

    // Override data labels for realtime charts
    let finalShowDataLabels = showDataLabels;
    const isRealtime = this.getAttribute('realtime') === 'true';
    if (isRealtime) {
      finalShowDataLabels = false;
    }

    const legendOptions = {
      show: showLegend,
      position: legendPosition,
      horizontalAlign: 'center',
      verticalAlign: legendPosition === 'top' ? 'top' : 'bottom',
      floating: false,
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: '#333',
        useSeriesColors: false
      },
      formatter: function(seriesName, opts) {
        return seriesName || 'Series';
      }
    };

    // Get base defaults and merge with chart-specific options
    const defaultOptions = {
      ...this.getBaseDefaultOptions('line'),
      chart: {
        ...this.getBaseDefaultOptions('line').chart,
        type: 'line',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar }
      },
      title: {
        text: title,
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#333'
        }
      },
      legend: legendOptions,
      dataLabels: {
        enabled: finalShowDataLabels
      },
      stroke: {
        curve: curve,
        width: lineWidth
      },
      markers: {
        size: this.markerSize,
        strokeColors: '#fff',
        strokeWidth: 2
      },
      ...options
    };

    // Apply realtime settings if enabled
    if (this.getAttribute('realtime') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
        zoom: { enabled: false }
      };
      defaultOptions.markers = {
        size: 0
      };
    }

    // Apply axis titles after merging options to ensure they're not overridden
    if (xAxisTitle) {
      const xAxisOffsetY = this.getAttribute('x-axis-offsety');
      console.log('Line Chart - Current x-axis title offsetY:', xAxisOffsetY || '2 (default)');
      defaultOptions.xaxis = {
        ...defaultOptions.xaxis,
        title: {
          text: xAxisTitle,
          style: {
            fontSize: '14px',
            color: '#333'
          },
          offsetY: xAxisOffsetY ? parseInt(xAxisOffsetY) : 2
        }
      };
    }

    // Apply x-axis label rotation if specified
    const xAxisLabelRotate = this.getAttribute('x-axis-label-rotate');
    if (xAxisLabelRotate && parseInt(xAxisLabelRotate) !== 0) {
      console.log('Line Chart - Applying x-axis label rotate:', xAxisLabelRotate);
      defaultOptions.xaxis = {
        ...defaultOptions.xaxis,
        position: 'bottom',
        labels: {
          ...defaultOptions.xaxis?.labels,
          rotate: parseInt(xAxisLabelRotate),
          rotateAlways: true,
          offsetY: parseInt(this.getAttribute('x-axis-label-rotate-offsety')) || 25
        }
      };
    }

    if (yAxisTitle) {
      defaultOptions.yaxis = {
        ...defaultOptions.yaxis,
        title: {
          text: yAxisTitle,
          style: {
            fontSize: '14px',
            color: '#333'
          }
        }
      };
    }

    // Apply categories if specified
    if (categories) {
      try {
        const categoriesArray = JSON.parse(categories);
        defaultOptions.xaxis = {
          ...defaultOptions.xaxis,
          categories: categoriesArray
        };
      } catch (error) {
        console.warn('Invalid categories format:', categories);
      }
    }

    // Apply dashed stroke settings for series that have dashed: true
    const dashArray = series.map(seriesItem => seriesItem.dashed === true ? 5 : 0);
    defaultOptions.stroke = {
      ...defaultOptions.stroke,
      dashArray: dashArray
    };

    // Apply gradient fill if gradient attribute is true
    if (this.getAttribute('gradient') !== 'false') {
      defaultOptions.fill = {
        type: 'gradient'
      };
    }

    try {
      this.chart = new ApexCharts(container, {
        ...defaultOptions,
        series: series
      });
      this.chart.render();
      this._options = defaultOptions; // Store current options for dynamic updates
    } catch (error) {
      console.error('Error creating line chart:', error);
      this.showError('Error creating line chart: ' + error.message);
    }
  }

  createAreaChart(container) {
    const data = this.parseData(this.getAttribute('data'));
    const options = this.parseOptions(this.getAttribute('options'));

    if (!this.validateChartData(data)) return;

    const series = this.formatAreaSeries(data);
    const showLegend = (this.getAttribute('show-legend') !== 'false') && (series.length > 1);
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.getAttribute('show-data-labels') === 'true';
    const xAxisTitle = this.getAttribute('x-axis-title') || '';
    const yAxisTitle = this.getAttribute('y-axis-title') || '';
    const curve = this.getAttribute('curve') || 'smooth';
    const categories = this.getAttribute('categories') || '[]';

    // Override data labels for realtime charts
    let finalShowDataLabels = showDataLabels;
    const isRealtime = this.getAttribute('realtime') === 'true';
    if (isRealtime) {
      finalShowDataLabels = false;
    }

    const legendOptions = {
      show: showLegend,
      position: legendPosition,
      horizontalAlign: 'center',
      verticalAlign: legendPosition === 'top' ? 'top' : 'bottom',
      floating: false,
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: '#333',
        useSeriesColors: false
      },
      formatter: function(seriesName, opts) {
        return seriesName || 'Series';
      }
    };

    const defaultOptions = {
      chart: {
        type: 'area',
        height: parseInt(this.getAttribute('height')) || 400,
        toolbar: { show: showToolbar },
        animations: { enabled: true },
        fontFamily: 'inherit'
      },
      title: {
        text: title,
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#333'
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { height: 250 },
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            verticalAlign: 'bottom',
            offsetX: 0,
            offsetY: 0
          }
        }
      }],
      grid: {
        show: true,
        borderColor: '#e7e7e7',
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        padding: {
          top: 10, right: 20, bottom: 10, left: 10
        }
      },
      legend: legendOptions,
      dataLabels: {
        enabled: finalShowDataLabels
      },
      stroke: {
        curve: curve,
        width: 2
      },
      markers: {
        size: this.markerSize,
        strokeColors: '#fff',
        strokeWidth: 2
      },
      tooltip: {
        enabled: true,
        followCursor: true,
        intersect: false,
        shared: false,
        theme: 'light',
        style: { fontSize: '12px' },
        onDatasetHover: { highlightDataSeries: false }
      },
      ...options
    };

    // Apply realtime settings if enabled
    if (this.getAttribute('realtime') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
        zoom: { enabled: false }
      };
      defaultOptions.markers = {
        size: 0
      };
    }

    // Apply axis titles after merging options to ensure they're not overridden
    if (xAxisTitle) {
      const xAxisOffsetY = this.getAttribute('x-axis-offsety');
      console.log('Area Chart - Current x-axis title offsetY:', xAxisOffsetY || '2 (default)');
      defaultOptions.xaxis = {
        ...defaultOptions.xaxis,
        title: {
          text: xAxisTitle,
          style: {
            fontSize: '14px',
            color: '#333'
          },
          offsetY: xAxisOffsetY ? parseInt(xAxisOffsetY) : 2
        }
      };
    }

    // Apply x-axis label rotation if specified
    const xAxisLabelRotate = this.getAttribute('x-axis-label-rotate');
    if (xAxisLabelRotate && parseInt(xAxisLabelRotate) !== 0) {
      console.log('Area Chart - Applying x-axis label rotate:', xAxisLabelRotate);
      defaultOptions.xaxis = {
        ...defaultOptions.xaxis,
        position: 'bottom',
        labels: {
          ...defaultOptions.xaxis?.labels,
          rotate: parseInt(xAxisLabelRotate),
          rotateAlways: true,
          offsetY: parseInt(this.getAttribute('x-axis-label-rotate-offsety')) || 25
        }
      };
    }

    if (yAxisTitle) {
      defaultOptions.yaxis = {
        ...defaultOptions.yaxis,
        title: {
          text: yAxisTitle,
          style: {
            fontSize: '14px',
            color: '#333'
          }
        }
      };
    }

    // Apply categories if specified
    if (categories) {
      try {
        const categoriesArray = JSON.parse(categories);
        defaultOptions.xaxis = {
          ...defaultOptions.xaxis,
          categories: categoriesArray
        };
      } catch (error) {
        console.warn('Invalid categories format:', categories);
      }
    }

    // Apply gradient fill if gradient attribute is true
    if (this.getAttribute('gradient') !== 'false') {
      defaultOptions.fill = {
        type: 'gradient'
      };
    }

    try {
      this.chart = new ApexCharts(container, {
        ...defaultOptions,
        series: series
      });
      this.chart.render();
      this._options = defaultOptions; // Store current options for dynamic updates
    } catch (error) {
      console.error('Error creating area chart:', error);
      this.showError('Error creating area chart: ' + error.message);
    }
  }

  createColumnChart(container) {
    const data = this.parseData(this.getAttribute('data'));
    const options = this.parseOptions(this.getAttribute('options'));

    if (!this.validateChartData(data)) return;

    const series = this.formatBarSeries(data);
    const showLegend = (this.getAttribute('show-legend') !== 'false') && (series.length > 1);
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.getAttribute('show-data-labels') === 'true';
    const xAxisTitle = this.getAttribute('x-axis-title') || '';
    const yAxisTitle = this.getAttribute('y-axis-title') || '';
    const barOrientation = this.getAttribute('bar-orientation') || 'vertical'; // Default to vertical for columns
    const curve = this.getAttribute('curve') || 'smooth';
    const categories = this.getAttribute('categories') || '[]';

    // Override data labels for realtime charts
    let finalShowDataLabels = showDataLabels;
    const isRealtime = this.getAttribute('realtime') === 'true';
    if (isRealtime) {
      finalShowDataLabels = false;
    }

    const legendOptions = {
      show: showLegend,
      position: legendPosition,
      horizontalAlign: 'center',
      verticalAlign: legendPosition === 'top' ? 'top' : 'bottom',
      floating: false,
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: '#333',
        useSeriesColors: false
      },
      formatter: function(seriesName, opts) {
        return seriesName || 'Series';
      }
    };

    // Base options following vanilla-js bar chart examples
    const defaultOptions = {
      series: series,
      chart: {
        type: 'bar',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar }
      },
      plotOptions: {
        bar: {
          horizontal: barOrientation === 'horizontal', // Will be false for vertical columns
          borderRadius: 4,
          borderRadiusApplication: 'end'
        }
      },
      dataLabels: {
        enabled: finalShowDataLabels
      },
      stroke: {
        curve: curve,
        width: 2
      },
      title: {
        text: title,
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#333'
        }
      },
      legend: legendOptions,
      grid: {
        show: true,
        borderColor: '#e7e7e7',
        strokeDashArray: 3,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: {
          top: 10, right: 20, bottom: 10, left: 10
        }
      },
      ...options
    };

    // Apply realtime settings if enabled
    if (this.getAttribute('realtime') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
        zoom: { enabled: false }
      };
    }

    // Apply axis titles after merging options to ensure they're not overridden
    if (xAxisTitle) {
      const xAxisOffsetY = this.getAttribute('x-axis-offsety');
      console.log('Column Chart - Current x-axis title offsetY:', xAxisOffsetY || '2 (default)');
      defaultOptions.xaxis = {
        ...defaultOptions.xaxis,
        title: {
          text: xAxisTitle,
          style: {
            fontSize: '14px',
            color: '#333'
          },
          offsetY: xAxisOffsetY ? parseInt(xAxisOffsetY) : 2
        }
      };
    }

    // Apply x-axis label rotation if specified
    const xAxisLabelRotate = this.getAttribute('x-axis-label-rotate');
    if (xAxisLabelRotate && parseInt(xAxisLabelRotate) !== 0) {
      console.log('Column Chart - Applying x-axis label rotate:', xAxisLabelRotate);
      defaultOptions.xaxis = {
        ...defaultOptions.xaxis,
        position: 'bottom',
        labels: {
          ...defaultOptions.xaxis?.labels,
          rotate: parseInt(xAxisLabelRotate),
          rotateAlways: true,
          offsetY: parseInt(this.getAttribute('x-axis-label-rotate-offsety')) || 25
        }
      };
    }

    if (yAxisTitle) {
      defaultOptions.yaxis = {
        ...defaultOptions.yaxis,
        title: {
          text: yAxisTitle,
          style: {
            fontSize: '14px',
            color: '#333'
          }
        }
      };
    }

    // Apply categories if specified
    if (categories) {
      try {
        const categoriesArray = JSON.parse(categories);
        defaultOptions.xaxis = {
          ...defaultOptions.xaxis,
          categories: categoriesArray
        };
      } catch (error) {
        console.warn('Invalid categories format:', categories);
      }
    }

    // Apply gradient fill if gradient attribute is true
    if (this.getAttribute('gradient') !== 'false') {
      defaultOptions.fill = {
        type: 'gradient'
      };
    }

    try {
      this.chart = new ApexCharts(container, defaultOptions);
      this.chart.render();
      this._options = defaultOptions; // Store current options for dynamic updates
    } catch (error) {
      console.error('Error creating column chart:', error);
      this.showError('Error creating column chart: ' + error.message);
    }
  }

  createBarChart(container) {
    const data = this.parseData(this.getAttribute('data'));
    const options = this.parseOptions(this.getAttribute('options'));

    if (!this.validateChartData(data)) return;

    const series = this.formatBarSeries(data);
    const showLegend = this.getAttribute('show-legend') === 'true' || (this.getAttribute('show-legend') !== 'false' && series.length > 1);
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.getAttribute('show-data-labels') === 'true';
    const xAxisTitle = this.getAttribute('x-axis-title') || '';
    const yAxisTitle = this.getAttribute('y-axis-title') || '';
    const categories = this.getAttribute('categories') || '[]';

    // Override data labels for realtime charts
    let finalShowDataLabels = showDataLabels;
    const isRealtime = this.getAttribute('realtime') === 'true';
    if (isRealtime) {
      finalShowDataLabels = false;
    }

    const legendOptions = {
      show: showLegend,
      position: legendPosition,
      horizontalAlign: 'center',
      verticalAlign: legendPosition === 'top' ? 'top' : 'bottom',
      floating: false,
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: '#333',
        useSeriesColors: false
      },
      formatter: function(seriesName, opts) {
        return seriesName || 'Series';
      }
    };

    // Base options following the provided horizontal bar chart example
    const defaultOptions = {
      series: series,
      chart: {
        type: 'bar',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: finalShowDataLabels,
        textAnchor: 'middle',
        style: {
          colors: ['#fff'],
          fontSize: '12px'
        },
        formatter: function(val) {
          return val.toString();
        },
        offsetX: 30,
        dropShadow: {
          enabled: false
        }
      },
      title: {
        text: title,
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#333'
        }
      },
      legend: legendOptions,
      xaxis: (() => {
        const xAxisOffsetY = this.getAttribute('x-axis-offsety');
        const xAxisLabelRotate = this.getAttribute('x-axis-label-rotate');
        console.log('Bar Chart - Current x-axis title offsetY:', xAxisOffsetY || '2 (default)');
        console.log('Bar Chart - Applying x-axis label rotate:', xAxisLabelRotate || '0 (default)');
        const xaxisConfig = {
          title: {
            text: xAxisTitle || '',
            style: {
              fontSize: '14px',
              color: '#333'
            },
            offsetY: xAxisOffsetY ? parseInt(xAxisOffsetY) : 2
          }
        };
        
        if (xAxisLabelRotate && parseInt(xAxisLabelRotate) !== 0) {
          xaxisConfig.position = 'bottom';
          xaxisConfig.labels = {
            rotate: parseInt(xAxisLabelRotate),
            rotateAlways: true,
            offsetY: parseInt(this.getAttribute('x-axis-label-rotate-offsety')) || 25
          };
        }
        
        return xaxisConfig;
      })(),
      yaxis: {
        categories: categories ? JSON.parse(categories) : ['South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan', 'United States', 'China', 'Germany'],
        title: {
          text: yAxisTitle || '',
          style: {
            fontSize: '14px',
            color: '#333'
          }
        }
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        style: { fontSize: '12px' }
      },
      grid: {
        show: true,
        borderColor: '#e7e7e7',
        strokeDashArray: 3,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: {
          top: 10, right: 20, bottom: 10, left: 10
        }
      },
      ...options
    };

    // Apply realtime settings if enabled
    if (this.getAttribute('realtime') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
        zoom: { enabled: false }
      };
    }

    // Apply gradient fill if gradient attribute is true
    if (this.getAttribute('gradient') !== 'false') {
      defaultOptions.fill = {
        type: 'gradient'
      };
    }

    try {
      this.chart = new ApexCharts(container, defaultOptions);
      this.chart.render();
      this._options = defaultOptions; // Store current options for dynamic updates
    } catch (error) {
      console.error('Error creating bar chart:', error);
      this.showError('Error creating bar chart: ' + error.message);
    }
  }

  createPieChart(container) {
    const data = this.parseData(this.getAttribute('data'));
    const options = this.parseOptions(this.getAttribute('options'));

    if (!this.validateChartData(data)) return;

    const series = this.formatPieSeries(data);
    const showLegend = this.getAttribute('show-legend') !== 'false';
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.getAttribute('show-data-labels') !== 'false';

    // Override data labels for realtime charts
    let finalShowDataLabels = showDataLabels;
    const isRealtime = this.getAttribute('realtime') === 'true';
    if (isRealtime) {
      finalShowDataLabels = false;
    }

    const legendOptions = {
      show: showLegend,
      position: legendPosition,
      horizontalAlign: 'center',
      verticalAlign: legendPosition === 'top' ? 'top' : 'bottom',
      floating: false,
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: '#333',
        useSeriesColors: false
      },
      formatter: function(seriesName, opts) {
        return seriesName || 'Series';
      }
    };

    // Get base defaults and merge with chart-specific options
    const defaultOptions = {
      ...this.getBaseDefaultOptions('pie'),
      chart: {
        ...this.getBaseDefaultOptions('pie').chart,
        type: 'pie',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar }
      },
      title: {
        text: title,
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333'
        }
      },
      legend: legendOptions,
      dataLabels: {
        enabled: finalShowDataLabels,
        style: {
          fontSize: '12px',
          colors: ['#fff']
        }
      },
      ...options
    };

    // Apply realtime settings if enabled
    if (this.getAttribute('realtime') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
        zoom: { enabled: false }
      };
    }

    // Handle labels and colors for pie charts
    if (Array.isArray(data) && data.length > 0) {
      if (data.length > 0 && typeof data[0] === 'object' && data[0].name) {
        // New format: [{"name": "Desktop", "data": 44, "color": "#008FFB"}]
        defaultOptions.labels = data.map(item => item.name);
        defaultOptions.colors = data.map(item => item.color).filter(color => color);
      } else if (Array.isArray(data[0]) && data[0].length === 2) {
        // Old format: [["Desktop", 44], ["Mobile", 23]]
        defaultOptions.labels = data.map(item => item[0]);
      } else if (typeof data === 'object') {
        defaultOptions.labels = Object.keys(data);
      }
    }

    // Apply gradient fill if gradient attribute is true
    if (this.getAttribute('gradient') !== 'false') {
      defaultOptions.fill = {
        type: 'gradient'
      };
    }

    try {
      this.chart = new ApexCharts(container, {
        ...defaultOptions,
        series: series
      });
      this.chart.render();
      this._options = defaultOptions; // Store current options for dynamic updates
    } catch (error) {
      console.error('Error creating pie chart:', error);
      this.showError('Error creating pie chart: ' + error.message);
    }
  }

  createDonutChart(container) {
    const data = this.parseData(this.getAttribute('data'));
    const options = this.parseOptions(this.getAttribute('options'));

    if (!this.validateChartData(data)) return;

    const series = this.formatDonutSeries(data);
    const showLegend = this.getAttribute('show-legend') !== 'false';
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.getAttribute('show-data-labels') !== 'false';
    const donutShowTotal = this.getAttribute('donut-show-total') !== 'false';

    // Override data labels for realtime charts
    let finalShowDataLabels = showDataLabels;
    const isRealtime = this.getAttribute('realtime') === 'true';
    if (isRealtime) {
      finalShowDataLabels = false;
    }

    const legendOptions = {
      show: showLegend,
      position: legendPosition,
      horizontalAlign: 'center',
      verticalAlign: legendPosition === 'top' ? 'top' : 'bottom',
      floating: false,
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: '#333',
        useSeriesColors: false
      },
      formatter: function(seriesName, opts) {
        return seriesName || 'Series';
      }
    };

    // Get base defaults and merge with chart-specific options
    const defaultOptions = {
      ...this.getBaseDefaultOptions('donut'),
      chart: {
        ...this.getBaseDefaultOptions('donut').chart,
        type: 'donut',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar }
      },
      title: {
        text: title,
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333'
        }
      },
      legend: legendOptions,
      dataLabels: {
        enabled: finalShowDataLabels,
        style: {
          fontSize: '12px',
          colors: ['#fff']
        }
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: showDataLabels,
              total: {
                show: donutShowTotal
              }
            }
          }
        }
      },
      ...options
    };

    // Apply realtime settings if enabled
    if (this.getAttribute('realtime') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
        zoom: { enabled: false }
      };
    }

    // Handle labels and colors for donut charts
    if (Array.isArray(data) && data.length > 0) {
      if (data.length > 0 && typeof data[0] === 'object' && data[0].name) {
        // New format: [{"name": "Chrome", "data": 65, "color": "#008FFB"}]
        defaultOptions.labels = data.map(item => item.name);
        defaultOptions.colors = data.map(item => item.color).filter(color => color);
      } else if (Array.isArray(data[0]) && data[0].length === 2) {
        // Old format: [["Chrome", 65], ["Firefox", 20]]
        defaultOptions.labels = data.map(item => item[0]);
      } else if (typeof data === 'object') {
        defaultOptions.labels = Object.keys(data);
      }
    }

    // Apply gradient fill if gradient attribute is true
    if (this.getAttribute('gradient') !== 'false') {
      defaultOptions.fill = {
        type: 'gradient'
      };
    }

    try {
      this.chart = new ApexCharts(container, {
        ...defaultOptions,
        series: series
      });
      this.chart.render();
      this._options = defaultOptions; // Store current options for dynamic updates
    } catch (error) {
      console.error('Error creating donut chart:', error);
      this.showError('Error creating donut chart: ' + error.message);
    }
  }

  createRadialBarChart(container) {
    const data = this.parseData(this.getAttribute('data'));
    const options = this.parseOptions(this.getAttribute('options'));

    if (!this.validateChartData(data)) return;

    const series = this.formatRadialBarSeries(data);
    const showLegend = this.getAttribute('show-legend') !== 'false';
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.getAttribute('show-data-labels') === 'true';
    const hollowSize = this.getAttribute('hollow-size') || '50%';
    const dashedRadial = this.getAttribute('dashed-radial') === 'true';
    const trackWidth = this.getAttribute('track-width') || '97%';

    // Override data labels for realtime charts
    let finalShowDataLabels = showDataLabels;
    const isRealtime = this.getAttribute('realtime') === 'true';
    if (isRealtime) {
      finalShowDataLabels = false;
    }

    const legendOptions = {
      show: showLegend && legendPosition !== 'hidden',
      position: legendPosition,
      horizontalAlign: 'center',
      verticalAlign: legendPosition === 'top' ? 'top' : 'bottom',
      floating: false,
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: '#333',
        useSeriesColors: false
      },
      formatter: function(seriesName, opts) {
        return seriesName || 'Series';
      }
    };

    // Get base defaults and merge with chart-specific options
    const defaultOptions = {
      ...this.getBaseDefaultOptions('radialBar'),
      chart: {
        ...this.getBaseDefaultOptions('radialBar').chart,
        type: 'radialBar',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar }
      },
      title: {
        text: title,
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333'
        }
      },
      legend: legendOptions,
      plotOptions: {
        radialBar: {
          hollow: {
            size: hollowSize
          },
          track: {
            strokeWidth: trackWidth
          }
        }
      },
      ...(dashedRadial && {
        stroke: {
          dashArray: 4
        }
      }),
      dataLabels: {
        enabled: finalShowDataLabels,
        formatter: function(val) {
          return val + "%";
        },
        style: {
          fontSize: '14px',
          colors: ['#fff']
        }
      },
      ...options
    };

    // Apply realtime settings if enabled
    if (this.getAttribute('realtime') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
        zoom: { enabled: false }
      };
    }

    // Handle labels and colors for radial bar charts
    if (Array.isArray(data) && data.length > 0) {
      if (data.length > 0 && typeof data[0] === 'object' && data[0].name) {
        // New format: [{"name": "Progress", "data": 70, "color": "#008FFB"}]
        defaultOptions.labels = data.map(item => item.name);
        defaultOptions.colors = data.map(item => item.color).filter(color => color);
      } else if (Array.isArray(data[0]) && data[0].length === 2) {
        // Old format: [["Progress", 70], ["Score", 80]]
        defaultOptions.labels = data.map(item => item[0]);
      } else if (typeof data === 'object') {
        defaultOptions.labels = Object.keys(data);
      }
    }

    // Apply gradient fill if gradient attribute is true
    if (this.getAttribute('gradient') !== 'false') {
      defaultOptions.fill = {
        type: 'gradient'
      };
    }

    try {
      this.chart = new ApexCharts(container, {
        ...defaultOptions,
        series: series
      });
      this.chart.render();
      this._options = defaultOptions; // Store current options for dynamic updates
    } catch (error) {
      console.error('Error creating radial bar chart:', error);
      this.showError('Error creating radial bar chart: ' + error.message);
    }
  }

  createScatterChart(container) {
    const data = this.parseData(this.getAttribute('data'));
    const options = this.parseOptions(this.getAttribute('options'));

    if (!this.validateChartData(data)) return;

    const series = this.formatScatterSeries(data);
    const showLegend = this.getAttribute('show-legend') !== 'false';
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.getAttribute('show-data-labels') === 'true';
    const xAxisTitle = this.getAttribute('x-axis-title') || '';
    const yAxisTitle = this.getAttribute('y-axis-title') || '';
    const curve = this.getAttribute('curve') || 'smooth';
    const categories = this.getAttribute('categories') || '[]';

    // Override data labels for realtime charts
    let finalShowDataLabels = showDataLabels;
    const isRealtime = this.getAttribute('realtime') === 'true';
    if (isRealtime) {
      finalShowDataLabels = false;
    }

    const legendOptions = {
      show: showLegend !== false, // Explicitly show for scatter plots
      position: legendPosition,
      horizontalAlign: legendPosition === 'right' ? 'left' : 'center',
      verticalAlign: legendPosition === 'top' ? 'top' : (legendPosition === 'bottom' ? 'bottom' : 'middle'),
      floating: legendPosition === 'right',
      offsetX: legendPosition === 'right' ? 10 : 0,
      offsetY: legendPosition === 'right' ? 0 : 0,
      labels: {
        colors: '#333',
        useSeriesColors: true
      },
      formatter: function(seriesName, opts) {
        return seriesName || 'Series';
      }
    };

    // Get base defaults and merge with chart-specific options
    const defaultOptions = {
      ...this.getBaseDefaultOptions('scatter'),
      chart: {
        ...this.getBaseDefaultOptions('scatter').chart,
        type: 'scatter',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar },
        zoom: { enabled: true, type: 'xy' } // Scatter charts benefit from zoom
      },
      title: {
        text: title,
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#333'
        }
      },
      legend: legendOptions,
      dataLabels: {
        enabled: finalShowDataLabels
      },
      stroke: {
        curve: curve,
        width: 2
      },
      markers: {
        size: this.markerSize,
        strokeColors: '#fff',
        strokeWidth: 2
      },
      xaxis: {
        tickAmount: 10,
        labels: {
          formatter: function(val) {
            return parseFloat(val).toFixed(1);
          }
        }
      },
      yaxis: {
        tickAmount: 7
      },
      ...options
    };

    // Apply realtime settings if enabled
    if (this.getAttribute('realtime') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
        zoom: { enabled: false }
      };
      defaultOptions.markers = {
        size: 0
      };
    }

    // Apply axis titles after merging options to ensure they're not overridden
    if (xAxisTitle) {
      const xAxisOffsetY = this.getAttribute('x-axis-offsety');
      console.log('Scatter Chart - Current x-axis title offsetY:', xAxisOffsetY || '2 (default)');
      defaultOptions.xaxis = {
        ...defaultOptions.xaxis,
        title: {
          text: xAxisTitle,
          style: {
            fontSize: '14px',
            color: '#333'
          },
          offsetY: xAxisOffsetY ? parseInt(xAxisOffsetY) : 2
        }
      };
    }

    // Apply x-axis label rotation if specified
    // Apply x-axis label rotation if specified
    const xAxisLabelRotate = this.getAttribute('x-axis-label-rotate');
    if (xAxisLabelRotate && parseInt(xAxisLabelRotate) !== 0) {
      console.log('Scatter Chart - Applying x-axis label rotate:', xAxisLabelRotate);
      defaultOptions.xaxis = {
        ...defaultOptions.xaxis,
        position: 'bottom',
        labels: {
          ...defaultOptions.xaxis?.labels,
          rotate: parseInt(xAxisLabelRotate),
          rotateAlways: true,
          offsetY: parseInt(this.getAttribute('x-axis-label-rotate-offsety')) || 25
        }
      };
    }

    if (yAxisTitle) {
      defaultOptions.yaxis = {
        ...defaultOptions.yaxis,
        title: {
          text: yAxisTitle,
          style: {
            fontSize: '14px',
            color: '#333'
          }
        }
      };
    }

    // Apply categories if specified
    if (categories) {
      try {
        const categoriesArray = JSON.parse(categories);
        defaultOptions.xaxis = {
          ...defaultOptions.xaxis,
          categories: categoriesArray
        };
      } catch (error) {
        console.warn('Invalid categories format:', error);
      }
    }

    // Apply gradient fill if gradient attribute is true
    if (this.getAttribute('gradient') !== 'false') {
      defaultOptions.fill = {
        type: 'gradient'
      };
    }

    try {
      this.chart = new ApexCharts(container, {
        ...defaultOptions,
        series: series
      });
      this.chart.render();
      this._options = defaultOptions; // Store current options for dynamic updates
    } catch (error) {
      console.error('Error creating scatter chart:', error);
      this.showError('Error creating scatter chart: ' + error.message);
    }
  }

  createRadarChart(container) {
    const data = this.parseData(this.getAttribute('data'));
    const options = this.parseOptions(this.getAttribute('options'));

    if (!this.validateChartData(data)) return;

    const series = this.formatSeries(data, 'radar');
    const showLegend = (this.getAttribute('show-legend') !== 'false') && (series.length > 1);
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.getAttribute('show-data-labels') === 'true';
    const categories = this.categories || [];

    // Realtime mode adjustments
    let finalShowDataLabels = showDataLabels;
    if (this.getAttribute('realtime') === 'true') {
      finalShowDataLabels = false;
    }

    const legendOptions = {
      show: showLegend,
      position: legendPosition,
      horizontalAlign: 'center',
      verticalAlign: legendPosition === 'top' ? 'top' : 'bottom',
      floating: false,
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: '#333',
        useSeriesColors: false
      },
      formatter: function(seriesName, opts) {
        return seriesName || 'Series';
      }
    };

    // Base defaults for radar (use base defaults and merge)
    let defaultOptions = {
      ...this.getBaseDefaultOptions('radar'),
      chart: {
        ...this.getBaseDefaultOptions('radar').chart,
        type: 'radar',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar }
      },
      title: {
        text: title,
        align: 'left',
        style: { fontSize: '16px', color: '#333' }
      },
      dropShadow: {
        enabled: true,
        blur: 1,
        left: 1,
        top: 1
      },
      fill: {
        opacity: 0.1
      },
      legend: legendOptions,
      dataLabels: { enabled: finalShowDataLabels },
      markers: { size: this.markerSize },
      xaxis: { categories: categories },
      yaxis: { stepSize: 20 }
    };

    // Deep-merge user `options` into defaults so nested objects are preserved
    defaultOptions = this.deepMerge(defaultOptions, options || {});

    // Ensure user-provided `options.chart` cannot remove the required chart type.
    defaultOptions.chart = { ...(defaultOptions.chart || {}), ...(options && options.chart ? options.chart : {}), type: 'radar' };

    
    try {
      this.chart = new ApexCharts(container, {
        ...defaultOptions,
        series: series
      });
      this.chart.render();
      this._options = defaultOptions;
    } catch (error) {
      console.error('Error creating radar chart:', error);
      this.showError('Error creating radar chart: ' + error.message);
    }
  }

  createPolarAreaChart(container) {
    const data = this.parseData(this.getAttribute('data'));
    const options = this.parseOptions(this.getAttribute('options'));

    if (!this.validateChartData(data)) return;

    // For polarArea charts we require `data` to be an array (not an object).
    // The project standard for polar/pie-like charts is array input
    // (e.g. `[44, 55, 13, 43]` or `[{name: 'A', data: 10}, ...]`). Bail out
    // with a helpful message if the consumer passes an object.
    if (!Array.isArray(data)) {
      this.showError('PolarArea chart requires `data` to be an array (e.g. [44,55,13]).');
      return;
    }

    // Series values (pie-style)
    const series = this.formatPieSeries(data);
    // Determine labels.
    // Expected: `categories` is an array when provided. Otherwise,
    // derive labels from array `data` payload (objects with .name, or
    // [label,value] pairs). Fall back to generic `Item N` labels.
    let labels = [];
    const cats = this.categories;
    if (Array.isArray(cats) && cats.length > 0) {
      labels = cats.slice();
    } else if (Array.isArray(data) && data.length > 0) {
      if (typeof data[0] === 'object' && data[0].name) {
        labels = data.map(item => item.name);
      } else if (Array.isArray(data[0]) && data[0].length >= 2) {
        labels = data.map(item => item[0]);
      } else {
        labels = series.map((v, i) => `Item ${i + 1}`);
      }
    } else {
      labels = series.map((v, i) => `Item ${i + 1}`);
    }

    // Ensure labels exactly match series length: trim or pad as needed.
    if (Array.isArray(series)) {
      if (labels.length > series.length) labels = labels.slice(0, series.length);
      while (labels.length < series.length) labels.push(`Item ${labels.length + 1}`);
    }

    // Parse optional `colors` attribute (JSON array) so consumers can pass
    // colors via: colors='["#FF4560","#00E396"]'
    let colorsFromAttr = null;
    const colorsAttr = this.getAttribute('colors');
    if (colorsAttr) {
      try {
        const parsed = JSON.parse(colorsAttr);
        if (Array.isArray(parsed) && parsed.length > 0) colorsFromAttr = parsed;
      } catch (err) {
        console.warn('Invalid colors attribute format:', colorsAttr);
      }
    }

    const showLegend = this.getAttribute('show-legend') !== 'false';
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.getAttribute('show-data-labels') === 'true';

    const legendOptions = {
      show: showLegend,
      position: legendPosition,
      horizontalAlign: 'center',
      verticalAlign: legendPosition === 'top' ? 'top' : 'bottom',
      floating: false,
      offsetX: 0,
      offsetY: 0
    };

    let defaultOptions = {
      ...this.getBaseDefaultOptions('polarArea'),
      chart: {
        ...this.getBaseDefaultOptions('polarArea').chart,
        type: 'polarArea',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar }
      },
      title: {
        text: title,
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#333'
        }
      },
      series: series,
      labels: labels,
      legend: legendOptions,
      dataLabels: { enabled: !!showDataLabels },
      plotOptions: {
        polarArea: {
          rings: { strokeWidth: 1 }
        }
      }
    };

    // Deep-merge user options so nested objects are preserved
    defaultOptions = this.deepMerge(defaultOptions, options || {});

    // If a `colors` attribute was provided (JSON array), prefer it unless
    // explicit `options.colors` exists.
    if (colorsFromAttr && (!defaultOptions.colors || defaultOptions.colors.length === 0)) {
      defaultOptions.colors = colorsFromAttr;
    }

    // Ensure chart type is preserved
    defaultOptions.chart = { ...(defaultOptions.chart || {}), ...(options && options.chart ? options.chart : {}), type: 'polarArea' };

    // Allow per-item colors (object items with .color) like pie/donut
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0].name) {
      const dataColors = data.map(item => item.color).filter(Boolean);
      if (dataColors && dataColors.length > 0 && (!defaultOptions.colors || defaultOptions.colors.length === 0)) {
        defaultOptions.colors = dataColors;
      }
    }

    try {
      this.chart = new ApexCharts(container, {
        ...defaultOptions,
        series: series
      });
      this.chart.render();
      this._options = defaultOptions;
    } catch (error) {
      console.error('Error creating polar area chart:', error);
      this.showError('Error creating polar area chart: ' + error.message);
    }
  }

  
  updateChart() {
    if (this.chart) {
      // For updates, we need to recreate the chart with new options
      // since individual attributes like legend settings need to be reapplied
      this.chart.destroy();
      this.chart = null;
      // Clear the container and recreate
      this.innerHTML = '';
      this.render();
    }
  }

  parseData(dataAttr) {
    if (!dataAttr) return [{"data": []}];

    try {
      return JSON.parse(dataAttr);
    } catch (e) {
      console.warn('Invalid data format:', dataAttr);
      return [{"data": []}];
    }
  }

  parseOptions(optionsAttr) {
    if (!optionsAttr) return {};

    try {
      return JSON.parse(optionsAttr);
    } catch (e) {
      console.warn('Invalid options format:', optionsAttr);
      return {};
    }
  }

  mapChartType(type) {
    const typeMap = {
      'line': 'line',
      'area': 'area',
      'column': 'column',
      'bar': 'bar',  // Horizontal bars
      'pie': 'pie',
      'donut': 'donut',
      'radialBar': 'radialBar',
      'scatter': 'scatter',
      'bubble': 'bubble',
      'heatmap': 'heatmap',
      'treemap': 'treemap',
      'radar': 'radar',
      'polarArea': 'polarArea',
      'rangeBar': 'rangeBar',
      'rangeArea': 'rangeArea',
      'candlestick': 'candlestick',
      'boxPlot': 'boxPlot'
    };
    return typeMap[type] || 'line';
  }

  formatSeries(data, type) {
    const chartType = this.mapChartType(type);

    // Handle different data formats based on chart type
    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === 'object' && data[0].name) {
        // Multiple series: [{"name": "Series 1", "data": [1, 2, 3]}] or [{"name": "Series 1", "data": {"Jan": 1, "Feb": 2}}]
        return data.map(series => ({
          name: series.name,
          data: this.formatSingleSeries(series.data, chartType)
        }));
      } else if (chartType === 'pie' || chartType === 'donut' || chartType === 'radialBar') {
        // Pie/Donut/Radial charts: [["Label", value], ["Label", value]] or [value, value, value]
        if (Array.isArray(data[0]) && data[0].length === 2) {
          // Data is [[label, value], [label, value]]
          return data.map(item => item[1]);
        } else {
          // Data is [value, value, value]
          return data;
        }
      } else {
        // Single series array: [[x, y], [x, y]] or [value, value]
        return [{
          name: 'Series 1',
          data: this.formatSingleSeries(data, chartType)
        }];
      }
    } else if (typeof data === 'object') {
      // Single series object: {"Jan": 100, "Feb": 120}
      return [{
        name: 'Series 1',
        data: this.formatSingleSeries(data, chartType)
      }];
    }

    return [];
  }

  // Utility: check plain object
  isPlainObject(obj) {
    return obj && typeof obj === 'object' && obj.constructor === Object;
  }

  // Deep merge source into target (returns a new object). Arrays are replaced.
  deepMerge(target, source) {
    if (!source) return target;
    if (Array.isArray(source)) return source.slice();
    const out = (Array.isArray(target) ? target.slice() : { ...target });
    Object.keys(source).forEach(key => {
      const srcVal = source[key];
      const tgtVal = out[key];
      if (this.isPlainObject(srcVal) && this.isPlainObject(tgtVal)) {
        out[key] = this.deepMerge(tgtVal, srcVal);
      } else {
        out[key] = srcVal;
      }
    });
    return out;
  }

  formatSingleSeries(data, chartType) {
    if (Array.isArray(data)) {
      if (chartType === 'pie' || chartType === 'donut' || chartType === 'radialBar') {
        // For pie/donut/radial charts, just return the values
        return data.map(item => typeof item === 'number' ? item : item[1]);
      } else if (data.length > 0 && Array.isArray(data[0])) {
        // Array of [x, y] pairs
        return data.map(point => ({
          x: point[0],
          y: point[1]
        }));
      } else {
        // Simple array of values
        return data;
      }
    } else if (typeof data === 'object') {
      // Object with key-value pairs
      if (chartType === 'pie' || chartType === 'donut' || chartType === 'radialBar') {
        // For pie/donut/radial charts, return just the values
        return Object.values(data);
      } else {
        // For other charts, return array of {x, y} objects
        return Object.entries(data).map(([x, y]) => ({ x, y }));
      }
    }
    return [];
  }

  // Public API methods
  updateData(newData) {
    this.setAttribute('data', JSON.stringify(newData));
  }

  updateOptions(newOptions) {
    const currentOptions = this.parseOptions(this.getAttribute('options'));
    const mergedOptions = { ...currentOptions, ...newOptions };
    this.setAttribute('options', JSON.stringify(mergedOptions));
  }

  getChart() {
    return this.chart;
  }

  setLoading(loading) {
    if (loading) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }

  // Event handling
  addEventListener(type, listener, options) {
    super.addEventListener(type, listener, options);
  }

  // Data export
  exportData() {
    if (this.chart) {
      return this.chart.data;
    }
    return null;
  }
}

// Add default styles for the apex-chart component
const styleId = 'sithaso-apex-default-styles';
if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    sithaso-apex {
      display: block;
      width: 100%;
      max-width: 100%;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
}

customElements.define('sithaso-apex', SithasoApex);
