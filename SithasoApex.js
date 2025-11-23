// ApexCharts should be loaded globally via CDN
// <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

class SithasoApex extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'data', 'options', 'height', 'width', 'theme', 'loading', 'show-legend', 'legend-position', 'show-toolbar', 'title', 'show-data-labels', 'data-label-orientation', 'data-label-position', 'x-axis-title', 'y-axis-title', 'bar-orientation', 'curve', 'line-width', 'categories', 'donut-show-total', 'hollow-size', 'dashed-radial', 'track-width', 'bar', 'x-axis-offsety', 'x-axis-label-rotate', 'x-axis-label-rotate-offsety', 'gradient', 'realtime', 'marker-size', 'stacked', 'border-radius', 'x-axis-output-format', 'y-axis-output-format', 'column-width', 'start-angle', 'end-angle', 'bar-labels'];
  }

  constructor() {
    super();
    this.chart = null;
    this._data = null;
    this._options = {};
    this._isLoading = false;
    this._pendingUpdates = {};
    this._updateTimeout = null;
    this._updateDelay = 100; // ms to wait before applying updates
    this._seriesMap = new Map(); // Store series in memory for runtime management
    this._categories = []; // Store categories in memory for runtime management
    this._colors = []; // Store colors in memory for runtime management
  }

  connectedCallback() {
    this.checkApexCharts();
    this.render();
  }

  disconnectedCallback() {
    if (this.chart) {
      try {
        this.chart.destroy();
      } catch (error) {
        console.warn('Error destroying chart during disconnection:', error);
      }
    }
  }

  // Debounced update method to batch multiple attribute changes
  _scheduleUpdate(attributeName, newValue) {
    // Clear any existing timeout
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }

    // Add this change to pending updates
    this._pendingUpdates[attributeName] = newValue;

    // Schedule the update
    this._updateTimeout = setTimeout(() => {
      this._applyPendingUpdates();
    }, this._updateDelay);
  }

  // Apply all pending updates at once
  _applyPendingUpdates() {
    if (!this.chart || Object.keys(this._pendingUpdates).length === 0) {
      return;
    }

    // Skip updates if chart container is not properly attached to DOM
    if (!this.chart.container || !document.contains(this.chart.container)) {
      this._pendingUpdates = {}; // Clear pending updates
      return;
    }

    const updates = { ...this._pendingUpdates };
    this._pendingUpdates = {}; // Clear before processing

    // Process data/options updates first (these use updateOptions/updateSeries)
    if (updates.data !== undefined) {
      try {
        const rawData = this.parseData(updates.data);
        const chartType = this.getAttribute('type') || 'line';
        let parsedData = rawData;
        // Convert parsed data into the expected shape for updateSeries
        if (chartType === 'pie' || chartType === 'donut' || chartType === 'radialBar' || chartType === 'polarArea') {
          parsedData = this.formatSeries(rawData, chartType);
        } else {
          parsedData = this.formatSeries(rawData, chartType);
        }
        this.chart.updateSeries(parsedData);
      } catch (error) {
        console.error('Error updating chart data:', error);
      }
    }

    if (updates.options !== undefined) {
      try {
        const options = this.parseOptions(updates.options);
        this.chart.updateOptions(options);
      } catch (error) {
        console.error('Error updating chart options:', error);
      }
    }

    // Process visual attribute updates
    const visualAttributes = ['title', 'height', 'width', 'show-legend', 'legend-position', 'show-toolbar', 'show-data-labels', 'data-label-orientation', 'data-label-position'];
    const visualUpdates = {};

    for (const [attr, value] of Object.entries(updates)) {
      if (visualAttributes.includes(attr)) {
        if (attr === 'title') {
          visualUpdates.title = { text: value };
        } else if (attr === 'height') {
          visualUpdates.chart = { ...visualUpdates.chart, height: parseInt(value) || 400 };
        } else if (attr === 'width') {
          visualUpdates.chart = { ...visualUpdates.chart, width: parseInt(value) || '100%' };
        } else if (attr === 'show-legend') {
          visualUpdates.legend = { show: value === 'true' };
        } else if (attr === 'legend-position') {
          visualUpdates.legend = { ...visualUpdates.legend, position: value };
        } else if (attr === 'show-toolbar') {
          visualUpdates.chart = { ...visualUpdates.chart, toolbar: { show: value === 'true' } };
        } else if (attr === 'show-data-labels') {
          visualUpdates.dataLabels = { enabled: value === 'true' };
        } else if (attr === 'data-label-orientation') {
          visualUpdates.plotOptions = visualUpdates.plotOptions || {};
          visualUpdates.plotOptions.bar = visualUpdates.plotOptions.bar || {};
          visualUpdates.plotOptions.bar.dataLabels = visualUpdates.plotOptions.bar.dataLabels || {};
          visualUpdates.plotOptions.bar.dataLabels.orientation = value;
        } else if (attr === 'data-label-position') {
          visualUpdates.plotOptions = visualUpdates.plotOptions || {};
          visualUpdates.plotOptions.bar = visualUpdates.plotOptions.bar || {};
          visualUpdates.plotOptions.bar.dataLabels = visualUpdates.plotOptions.bar.dataLabels || {};
          visualUpdates.plotOptions.bar.dataLabels.position = value;
        }
      }
    }

    // Apply visual updates if any
    if (Object.keys(visualUpdates).length > 0) {
      try {
        this.chart.updateOptions(visualUpdates);
      } catch (error) {
        console.error('Error updating chart options:', error);
      }
    }
  }

  // Force immediate application of any pending updates
  forceUpdate() {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
      this._updateTimeout = null;
    }
    this._applyPendingUpdates();
  }

  // Set the debounce delay (in milliseconds)
  setUpdateDelay(delay) {
    this._updateDelay = Math.max(0, delay);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'loading') {
      this._isLoading = newValue !== null;
      this.updateLoadingState();
    } else if (name === 'type') {
      // Type change requires immediate chart recreation (can't be debounced)
      if (this.chart) {
        try {
          this.chart.destroy();
        } catch (error) {
          console.warn('Error destroying chart during type change:', error);
        }
        this.chart = null;
      }
      this.render();
    } else {
      // All other attributes are debounced for better performance
      this._scheduleUpdate(name, newValue);
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

  // Getter for the `border-radius` attribute. Defaults to 4 when not set.
  get borderRadius() {
    const v = this.getAttribute('border-radius');
    const n = parseInt(v, 10);
    return (!isNaN(n) && n >= 0) ? n : 4;
  }

  // Getter for axis output format attributes. Allowed values: 'money','thousand','normal','date','datetime','time'
  get xAxisOutputFormat() {
    const v = (this.getAttribute('x-axis-output-format') || 'normal').toString();
    return ['money', 'thousand', 'normal', 'date', 'datetime', 'time'].includes(v) ? v : 'normal';
  }

  get yAxisOutputFormat() {
    const v = (this.getAttribute('y-axis-output-format') || 'normal').toString();
    return ['money', 'thousand', 'normal', 'date', 'datetime', 'time'].includes(v) ? v : 'normal';
  }

  // Format a single axis value according to the requested output format
  _formatValueForAxis(val, fmt) {
    if (!fmt || fmt === 'normal') return val;
    // Try numeric formatting first for money/thousand
    if (fmt === 'money' || fmt === 'thousand') {
      const n = Number(val);
      if (isNaN(n)) return val;
      if (fmt === 'money') {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
      }
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
    }

    // Date formatting: accept numeric timestamps or parseable date strings
    if (fmt === 'date' || fmt === 'datetime') {
      let d = null;
      if (typeof val === 'number') d = new Date(val);
      else if (typeof val === 'string' && /^[0-9]+$/.test(val)) d = new Date(Number(val));
      else d = new Date(val);
      if (isNaN(d.getTime())) return val;
      const pad = (s) => String(s).padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      if (fmt === 'date') return `${yyyy}-${mm}-${dd}`;
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    }

    // Time formatting: HH:mm
    if (fmt === 'time') {
      let d = null;
      if (typeof val === 'number') d = new Date(val);
      else if (typeof val === 'string' && /^[0-9]+$/.test(val)) d = new Date(Number(val));
      else d = new Date(val);
      if (isNaN(d.getTime())) return val;
      const pad = (s) => String(s).padStart(2, '0');
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${hh}:${min}`;
    }

    return val;
  }

  // Inject label formatter functions into defaultOptions.xaxis/yaxis when not provided by user options
  _applyAxisOutputFormats(defaultOptions) {
    try {
      const xfmt = this.xAxisOutputFormat;
      const yfmt = this.yAxisOutputFormat;

      if (defaultOptions && xfmt && xfmt !== 'normal') {
        defaultOptions.xaxis = defaultOptions.xaxis || {};
        defaultOptions.xaxis.labels = defaultOptions.xaxis.labels || {};
        if (typeof defaultOptions.xaxis.labels.formatter === 'undefined') {
          defaultOptions.xaxis.labels.formatter = (val) => this._formatValueForAxis(val, xfmt);
        }
      }

      if (defaultOptions && yfmt && yfmt !== 'normal') {
        if (Array.isArray(defaultOptions.yaxis)) {
          defaultOptions.yaxis = defaultOptions.yaxis.map(y => {
            y = y || {};
            y.labels = y.labels || {};
            if (typeof y.labels.formatter === 'undefined') {
              y.labels.formatter = (val) => this._formatValueForAxis(val, yfmt);
            }
            return y;
          });
        } else {
          defaultOptions.yaxis = defaultOptions.yaxis || {};
          defaultOptions.yaxis.labels = defaultOptions.yaxis.labels || {};
          if (typeof defaultOptions.yaxis.labels.formatter === 'undefined') {
            defaultOptions.yaxis.labels.formatter = (val) => this._formatValueForAxis(val, yfmt);
          }
        }
      }
    } catch (e) {
      // non-fatal - don't block chart creation
      console.warn('Failed to apply axis output formats', e);
    }
  }

  render() {
    if (!this.checkApexCharts()) return;

    // Clear any previous content (e.g., error messages)
    this.innerHTML = '';

    const container = document.createElement('div');
    container.style.height = this.getAttribute('height') || '300px';
    container.style.width = this.getAttribute('width') || '100%';
    container.style.transition = 'opacity 0.3s ease';
    // For circular charts, allow overflow to prevent clipping
    const chartType = this.mapChartType(this.getAttribute('type') || 'line');

    // Default to forcing rounded stacks for bar/column charts unless the
    // user explicitly set the attribute. This makes pill-shaped ends the
    // default visual for stacked bars/columns.
    if ((chartType === 'bar' || chartType === 'column') && this.getAttribute('force-rounded-stacks') === null) {
      this.setAttribute('force-rounded-stacks', 'true');
    }
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
      tooltip: {
        enabled: true,
        shared: true,
        followCursor: true,
        intersect: false,
        x: {
          show: true,
        },
        y: {
          show: true,
        }
      },
      // By default disable x-axis label tooltips to avoid hover popups on axis labels
      xaxis: {
        tooltip: { enabled: false }
      },
      yaxis: {
        tooltip: { enabled: false }
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
      }]
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

  // Getter for optional `column-width` attribute. If not set, component
  // will leave the value undefined so ApexCharts uses its own default ('70%').
  get columnWidth() {
    const v = this.getAttribute('column-width');
    return v ? v.toString() : null;
  }

  // Getter for bar-labels attribute (boolean). Defaults to false.
  get barLabels() {
    const v = this.getAttribute('bar-labels');
    return v === 'true';
  }

  // Getter for radial bar start-angle (degrees). Default 0.
  get startAngle() {
    const v = this.getAttribute('start-angle');
    const n = parseInt(v, 10);
    return (!isNaN(n)) ? n : 0;
  }

  // Getter for radial bar end-angle (degrees). Default 270.
  get endAngle() {
    const v = this.getAttribute('end-angle');
    const n = parseInt(v, 10);
    return (!isNaN(n)) ? n : 360;
  }

  // Getters and setters for all observedAttributes
  get typeOf() { return this.getAttribute('type'); }
  set typeOf(value) { this.setAttribute('type', value); }

  get data() { return this.parseData(this.getAttribute('data')); }
  set data(value) {
    const jsonValue = JSON.stringify(value);
    this.setAttribute('data', jsonValue);
    // If chart exists, update it directly (attributeChangedCallback will handle it)
  }

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

  // Getter/setter for show-data-labels to normalize the boolean behavior
  get showDataLabels() {
    return this.hasAttribute('show-data-labels') && this.getAttribute('show-data-labels') !== 'false';
  }
  set showDataLabels(value) {
    if (value === false || value === 'false' || value === null || value === undefined) {
      this.removeAttribute('show-data-labels');
    } else {
      // Set explicit true string so attributeExists checks pass
      this.setAttribute('show-data-labels', 'true');
    }
  }

  get xAxisTitle() { return this.getAttribute('x-axis-title'); }
  set xAxisTitle(value) { this.setAttribute('x-axis-title', value); }

  get yAxisTitle() { return this.getAttribute('y-axis-title'); }
  set yAxisTitle(value) { this.setAttribute('y-axis-title', value); }

  get barOrientation() { return this.getAttribute('bar-orientation'); }
  set barOrientation(value) { this.setAttribute('bar-orientation', value); }

  // Getter/setter for data-label-orientation: values like 'vertical' or 'horizontal'
  get dataLabelOrientation() { return this.getAttribute('data-label-orientation'); }
  set dataLabelOrientation(value) {
    if (value === null || value === undefined) {
      this.removeAttribute('data-label-orientation');
    } else {
      this.setAttribute('data-label-orientation', value);
    }
  }
  // Getter/setter for data-label-position: values like 'top', 'center', 'bottom'
  get dataLabelPosition() { return this.getAttribute('data-label-position'); }
  set dataLabelPosition(value) {
    if (value === null || value === undefined) {
      this.removeAttribute('data-label-position');
    } else {
      this.setAttribute('data-label-position', value);
    }
  }

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

  // stacked: boolean attribute controlling whether certain charts are stacked
  get stacked() { return this.getAttribute('stacked') === 'true'; }
  set stacked(value) { this.setAttribute('stacked', value ? 'true' : 'false'); }

  // ===== UTILITY METHODS =====

  validateChartData(data) {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      this.showError('No data provided for chart');
      return false;
    }
    // Allow empty arrays as they might be valid for dynamic charts
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
    const showDataLabels = this.showDataLabels;
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

    // Apply stacking if requested
    if (this.getAttribute('stacked') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        stacked: true
      };

      // When bars are stacked, Apex may round each segment depending on configuration.
      // Set `borderRadiusWhenStacked` to prefer rounding only the outermost segment.
      defaultOptions.plotOptions = {
        ...defaultOptions.plotOptions,
        bar: {
          ...defaultOptions.plotOptions.bar,
          // prefer 'all' so stacked segments get rounded when requested
          borderRadiusWhenStacked: 'all'
        }
      };
    }

    // Apply axis titles after merging options to ensure they're not overridden
    if (xAxisTitle) {
      const xAxisOffsetY = this.getAttribute('x-axis-offsety');
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

    // Ensure bar corner radius default when not provided in options
    try {
      defaultOptions.plotOptions = defaultOptions.plotOptions || {};
      defaultOptions.plotOptions.bar = defaultOptions.plotOptions.bar || {};
      if (typeof defaultOptions.plotOptions.bar.borderRadius === 'undefined') {
        defaultOptions.plotOptions.bar.borderRadius = 4;
      }
      // Apply optional column/columnWidth override if provided via attribute
      if (this.columnWidth) {
        defaultOptions.plotOptions.bar.columnWidth = this.columnWidth;
      }
    } catch (e) {
      // ignore
    }



      // Ensure categories are attached to xaxis for line charts
      try {
        let parsedCategories = null;
        try {
          parsedCategories = categories ? JSON.parse(categories) : null;
        } catch (e) {
          parsedCategories = null;
        }

        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          defaultOptions.xaxis = {
            ...(defaultOptions.xaxis || {}),
            categories: parsedCategories
          };
        }
      } catch (e) {
        // ignore
      }

    // If series include per-series colors, copy them into options.colors
    // unless the user explicitly provided options.colors.
    try {
      const seriesColors = Array.isArray(series) ? series.map(s => s && s.color).filter(Boolean) : [];
      if (seriesColors.length > 0 && (!defaultOptions.colors || defaultOptions.colors.length === 0)) {
        defaultOptions.colors = seriesColors;
        if (defaultOptions.legend && defaultOptions.legend.labels) {
          defaultOptions.legend.labels.useSeriesColors = true;
        }
      }
    } catch (e) {
      // ignore
    }

    try {
      try { this._applyAxisOutputFormats(defaultOptions); } catch (e) {}
      // Apply data label orientation (if set) to plotOptions.bar so we don't clobber other bar options
      if (this.hasAttribute('data-label-orientation')) {
        defaultOptions.plotOptions = defaultOptions.plotOptions || {};
        defaultOptions.plotOptions.bar = defaultOptions.plotOptions.bar || {};
        defaultOptions.plotOptions.bar.dataLabels = defaultOptions.plotOptions.bar.dataLabels || {};
        defaultOptions.plotOptions.bar.dataLabels.orientation = this.getAttribute('data-label-orientation');
      }
      if (this.hasAttribute('data-label-position')) {
        defaultOptions.plotOptions = defaultOptions.plotOptions || {};
        defaultOptions.plotOptions.bar = defaultOptions.plotOptions.bar || {};
        defaultOptions.plotOptions.bar.dataLabels = defaultOptions.plotOptions.bar.dataLabels || {};
        defaultOptions.plotOptions.bar.dataLabels.position = this.getAttribute('data-label-position');
      }
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
    const showDataLabels = this.showDataLabels;
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
      ...this.getBaseDefaultOptions('area'),
      chart: {
        ...this.getBaseDefaultOptions('area').chart,
        type: 'area',
        height: parseInt(this.getAttribute('height')) || 400,
        toolbar: { show: showToolbar },
        animations: { enabled: true }
      },
      title: {
        text: title,
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#333'
        }
      },
      // keep responsive/grid overrides that differ from base
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

    
    // Apply stacking if requested
    if (this.getAttribute('stacked') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        stacked: true
      };
      // prefer 'all' so stacked segments get rounded when requested
      defaultOptions.plotOptions = {
        ...defaultOptions.plotOptions,
        bar: {
          ...((defaultOptions.plotOptions && defaultOptions.plotOptions.bar) || {}),
          borderRadiusWhenStacked: 'all'
        }
      };
    }


    // Apply axis titles after merging options to ensure they're not overridden
    if (xAxisTitle) {
      const xAxisOffsetY = this.getAttribute('x-axis-offsety');
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
      try { this._applyAxisOutputFormats(defaultOptions); } catch (e) {}
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
    const showDataLabels = this.showDataLabels;
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
      ...this.getBaseDefaultOptions('column'),
      series: series,
      chart: {
        ...this.getBaseDefaultOptions('column').chart,
        type: 'bar',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar }
      },
      plotOptions: {
        bar: {
          horizontal: barOrientation === 'horizontal', // Will be false for vertical columns
          borderRadius: this.borderRadius,
          // For vertical columns we want rounded corners on both top and bottom ('around').
          // For horizontal bars keep 'end' to round only the outer end.
          borderRadiusApplication: 'around',
          borderRadiusWhenStacked: 'all',
        }
      },
      // Allow explicit orientation of data labels on bar/column charts (applied below to avoid replacement)
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

    // Apply stacking if requested
    if (this.getAttribute('stacked') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        stacked: true
      };
      // When columns are stacked, prefer rounding all stacked segments
          defaultOptions.plotOptions = {
        ...defaultOptions.plotOptions,
        bar: {
          ...((defaultOptions.plotOptions && defaultOptions.plotOptions.bar) || {}),
          borderRadiusWhenStacked: 'all',
          borderRadius: this.borderRadius,           // radius from attribute
          borderRadiusApplication: 'around', // top & bottom corners
          endingShape: 'rounded',     // optional, softer look
          startingShape: 'rounded'    // optional
        }
      };
    }

    // Apply axis titles after merging options to ensure they're not overridden
    if (xAxisTitle) {
      const xAxisOffsetY = this.getAttribute('x-axis-offsety');
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
        if (barOrientation === 'horizontal') {
          defaultOptions.yaxis = {
            ...defaultOptions.yaxis,
            categories: categoriesArray
          };
        } else {
          defaultOptions.xaxis = {
            ...defaultOptions.xaxis,
            categories: categoriesArray
          };
        }
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

    // If series include per-series colors, copy them into options.colors
    // unless the user explicitly provided options.colors.
    try {
      const seriesColors = Array.isArray(series) ? series.map(s => s && s.color).filter(Boolean) : [];
      if (seriesColors.length > 0 && (!defaultOptions.colors || defaultOptions.colors.length === 0)) {
        defaultOptions.colors = seriesColors;
        if (defaultOptions.legend && defaultOptions.legend.labels) {
          defaultOptions.legend.labels.useSeriesColors = true;
        }
      }
    } catch (e) {
      // ignore
    }

    try {
      try { this._applyAxisOutputFormats(defaultOptions); } catch (e) {}
      // Apply data label orientation (if set) to bar charts
      if (this.hasAttribute('data-label-orientation')) {
        defaultOptions.plotOptions = defaultOptions.plotOptions || {};
        defaultOptions.plotOptions.bar = defaultOptions.plotOptions.bar || {};
        defaultOptions.plotOptions.bar.dataLabels = defaultOptions.plotOptions.bar.dataLabels || {};
        defaultOptions.plotOptions.bar.dataLabels.orientation = this.getAttribute('data-label-orientation');
      }
      if (this.hasAttribute('data-label-position')) {
        defaultOptions.plotOptions = defaultOptions.plotOptions || {};
        defaultOptions.plotOptions.bar = defaultOptions.plotOptions.bar || {};
        defaultOptions.plotOptions.bar.dataLabels = defaultOptions.plotOptions.bar.dataLabels || {};
        defaultOptions.plotOptions.bar.dataLabels.position = this.getAttribute('data-label-position');
      }
      // Ensure columnWidth is present in the final options before creating the chart
      try {
        if (this.columnWidth) {
          defaultOptions.plotOptions = defaultOptions.plotOptions || {};
          defaultOptions.plotOptions.bar = defaultOptions.plotOptions.bar || {};
          defaultOptions.plotOptions.bar.columnWidth = this.columnWidth;
        }
      } catch (e) {}
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
    const showDataLabels = this.showDataLabels;
    const xAxisTitle = this.getAttribute('x-axis-title') || '';
    const yAxisTitle = this.getAttribute('y-axis-title') || '';
    const categories = this.getAttribute('categories') || '[]';
    const dataLabelPositionAttr = this.getAttribute('data-label-position') || 'center';

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
      ...this.getBaseDefaultOptions('bar'),
      series: series,
      chart: {
        ...this.getBaseDefaultOptions('bar').chart,
        type: 'bar',
        height: parseInt(this.getAttribute('height')) || 350,
        toolbar: { show: showToolbar }
      },
      plotOptions: {
        bar: {
          borderRadius: this.borderRadius,
          borderRadiusApplication: 'around',
          horizontal: true,
          borderRadiusWhenStacked: 'all',
          startingShape: 'rounded',
          endingShape: 'rounded'
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
        offsetX: (dataLabelPositionAttr === 'center') ? 0 : 30,
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

        // Ensure labels are visible by default
        xaxisConfig.labels = {
          ...(xaxisConfig.labels || {}),
          show: true
        };

        return xaxisConfig;
      })(),
      // yaxis: keep title/labels; categories will be attached to xaxis.categories
      yaxis: {
        title: {
          text: yAxisTitle || '',
          style: {
            fontSize: '14px',
            color: '#333'
          }
        },
        labels: {
          show: true
        }
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

    
    // Ensure bar corner radius default when not provided in options
    try {
      defaultOptions.plotOptions = defaultOptions.plotOptions || {};
      defaultOptions.plotOptions.bar = defaultOptions.plotOptions.bar || {};
      if (typeof defaultOptions.plotOptions.bar.borderRadius === 'undefined') {
        defaultOptions.plotOptions.bar.borderRadius = 4;
      }
      // Apply optional column-width override if provided via attribute
      if (this.columnWidth) {
        defaultOptions.plotOptions.bar.columnWidth = this.columnWidth;
      }
    } catch (e) {
      // ignore
    }

    // If series include per-series colors, copy them into options.colors
    // unless the user explicitly provided options.colors.
    try {
      const seriesColors = Array.isArray(series) ? series.map(s => s && s.color).filter(Boolean) : [];
      if (seriesColors.length > 0 && (!defaultOptions.colors || defaultOptions.colors.length === 0)) {
        defaultOptions.colors = seriesColors;
        if (defaultOptions.legend && defaultOptions.legend.labels) {
          defaultOptions.legend.labels.useSeriesColors = true;
        }
      }
    } catch (e) {
      // ignore
    }

    // Apply stacking if requested
    if (this.getAttribute('stacked') === 'true') {
      defaultOptions.chart = {
        ...defaultOptions.chart,
        stacked: true
      };
      // Prefer rounding all stacked segments for bar charts
      defaultOptions.plotOptions = {
        ...defaultOptions.plotOptions,
        bar: {
          ...((defaultOptions.plotOptions && defaultOptions.plotOptions.bar) || {}),
          borderRadiusWhenStacked: 'all',
          borderRadius: this.borderRadius,
          borderRadiusApplication: 'around',
          startingShape: 'rounded',
          endingShape: 'rounded'
        }
      };
    }

    // Attach parsed categories to yaxis.categories for horizontal bar charts.
    // ApexCharts handles horizontal bars with categories on y-axis.
    try {
      const parsed = categories ? JSON.parse(categories) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        defaultOptions.yaxis = {
          ...(defaultOptions.yaxis || {}),
          categories: parsed
        };
        // Keep xaxis.categories in sync for consistency
        defaultOptions.xaxis = {
          ...(defaultOptions.xaxis || {}),
          categories: parsed
        };
      }
    } catch (e) {
      // ignore invalid categories
    }



    try {
      try { this._applyAxisOutputFormats(defaultOptions); } catch (e) {}
      // Ensure columnWidth is present in the final options before creating the chart
      try {
        if (this.columnWidth) {
          defaultOptions.plotOptions = defaultOptions.plotOptions || {};
          defaultOptions.plotOptions.bar = defaultOptions.plotOptions.bar || {};
          defaultOptions.plotOptions.bar.columnWidth = this.columnWidth;
        }
      } catch (e) {}
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
    const showDataLabels = this.showDataLabels;

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
      try { this._applyAxisOutputFormats(defaultOptions); } catch (e) {}
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
    const showDataLabels = this.showDataLabels;
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
      try { this._applyAxisOutputFormats(defaultOptions); } catch (e) {}
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
    // Default radialBar legend hidden; only show when `show-legend="true"` is set
    const showLegend = this.getAttribute('show-legend') === 'true';
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.showDataLabels;
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
          ,
          startAngle: this.startAngle,
          endAngle: this.endAngle,
          barLabels: {
            enabled: this.barLabels === true,
            useSeriesColors: true,
            offsetX: -8,
            fontSize: '14px',
            formatter: function(seriesName, opts) {
              return seriesName + ":  " + (opts && opts.w && opts.w.globals && opts.w.globals.series ? opts.w.globals.series[opts.seriesIndex] : '');
            }
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
      try { this._applyAxisOutputFormats(defaultOptions); } catch (e) {}
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
    const showDataLabels = this.showDataLabels;
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
      try { this._applyAxisOutputFormats(defaultOptions); } catch (e) {}
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

    // Normalize input so radar receives numeric arrays and categories are set.
    // Accept these shapes:
    // - Single series object: {A:10,B:20} -> series: [{name:'Series 1', data: [10,20]}], categories: ['A','B']
    // - Multiple series array: [{name:'S1', data: {A:1,B:2}}, {name:'S2', data: {A:3,B:4}}]
    // - Existing array formats remain supported.
    let radarCategories = this.categories || [];
    let radarSeries = null;
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0].name && data[0].data && typeof data[0].data === 'object' && !Array.isArray(data[0].data)) {
      // Multiple named series with object-shaped data
      // Derive categories from first series if not provided
      const firstKeys = Object.keys(data[0].data);
      if ((!radarCategories || radarCategories.length === 0) && firstKeys.length > 0) radarCategories = firstKeys.slice();
      radarSeries = data.map(s => ({
        name: s.name || 'Series',
        data: Array.isArray(s.data) ? s.data.slice() : Object.values(s.data)
      }));
    } else if (!Array.isArray(data) && data && typeof data === 'object') {
      // Single-series object form
      radarCategories = Object.keys(data);
      radarSeries = [{ name: this.getAttribute('title') || 'Series 1', data: Object.values(data) }];
    } else {
      // Fallback to existing formatter for arrays/other forms
      radarSeries = this.formatSeries(data, 'radar');
    }

    const series = radarSeries;
    const showLegend = (this.getAttribute('show-legend') !== 'false') && (series.length > 1);
    const legendPosition = this.getAttribute('legend-position') || 'bottom';
    const showToolbar = this.getAttribute('show-toolbar') !== 'false';
    const title = this.getAttribute('title') || '';
    const showDataLabels = this.showDataLabels;
    const categories = radarCategories || [];

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

    // If series include per-series colors, copy them into options.colors
    // unless the user explicitly provided options.colors.
    try {
      const seriesColors = Array.isArray(series) ? series.map(s => s && s.color).filter(Boolean) : [];
      if (seriesColors.length > 0 && (!defaultOptions.colors || defaultOptions.colors.length === 0)) {
        defaultOptions.colors = seriesColors;
        if (defaultOptions.legend && defaultOptions.legend.labels) {
          defaultOptions.legend.labels.useSeriesColors = true;
        }
      }
    } catch (e) {
      // ignore
    }

    
    try {
      try { this._applyAxisOutputFormats(defaultOptions); } catch (e) {}
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

    // Support both array and object-shaped inputs for polarArea.
    // If an object is provided (e.g. {A:10,B:20}), convert it to an
    // array of values and extract labels like pie/donut.
    let polarLabelsFromObj = null;
    let inputData = data;
    if (!Array.isArray(data) && data && typeof data === 'object') {
      polarLabelsFromObj = Object.keys(data);
      inputData = Object.values(data);
    }

    // Series values (pie-style)
    const series = this.formatPieSeries(inputData);
    // Determine labels. Prefer explicit `categories` attr, then object-derived labels,
    // then derive from array-shaped `inputData` payload, otherwise fall back to generic labels.
    let labels = [];
    const cats = this.categories;
    if (Array.isArray(cats) && cats.length > 0) {
      labels = cats.slice();
    } else if (polarLabelsFromObj && polarLabelsFromObj.length > 0) {
      labels = polarLabelsFromObj.slice();
    } else if (Array.isArray(inputData) && inputData.length > 0) {
      if (typeof inputData[0] === 'object' && inputData[0].name) {
        labels = inputData.map(item => item.name);
      } else if (Array.isArray(inputData[0]) && inputData[0].length >= 2) {
        labels = inputData.map(item => item[0]);
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

    // Reorder series/labels so display can be arranged by value (staggered appearance).
    // This sorts pairs by value descending so large/small values alternate visually.
    try {
      if (Array.isArray(series) && series.length > 1) {
        const pairs = series.map((v, i) => ({ value: v, label: labels[i] || `Item ${i+1}`, color: (Array.isArray(data) && typeof data[i] === 'object') ? data[i].color : null }));
        // sort descending by value
        pairs.sort((a, b) => b.value - a.value);
        // write back
        series = pairs.map(p => p.value);
        labels = pairs.map(p => p.label);
        // if no colors were provided via colorsAttr/options, prefer per-item colors in this new order
        const perItemColors = pairs.map(p => p.color).filter(Boolean);
        if (perItemColors.length > 0 && (!colorsFromAttr)) {
          // will be applied later into defaultOptions.colors
          // store temporarily on dataColors variable used below
          var _reorderedDataColors = perItemColors;
        }
      }
    } catch (e) {
      // non-fatal
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
    const showDataLabels = this.showDataLabels;

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
    if (Array.isArray(inputData) && inputData.length > 0 && typeof inputData[0] === 'object' && inputData[0].name) {
      const dataColors = inputData.map(item => item.color).filter(Boolean);
      // prefer explicit per-item colors from data objects, but if we reordered above
      // and produced _reorderedDataColors, prefer that order when no explicit colorsAttr/options exist.
      const finalDataColors = (typeof _reorderedDataColors !== 'undefined' && _reorderedDataColors.length > 0) ? _reorderedDataColors : dataColors;
      if (finalDataColors && finalDataColors.length > 0 && (!defaultOptions.colors || defaultOptions.colors.length === 0)) {
        defaultOptions.colors = finalDataColors;
      }
    }

    try {
      try { this._applyAxisOutputFormats(defaultOptions); } catch (e) {}
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
      try {
        this.chart.destroy();
      } catch (error) {
        console.warn('Error destroying chart during update:', error);
      }
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
        // Multiple series: preserve per-series color and dashed flags so charts like radar use provided colors
        return data.map(series => ({
          name: series.name,
          data: this.formatSingleSeries(series.data, chartType),
          color: series.color,
          dashed: series.dashed || false
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
    // Update via attribute, which triggers attributeChangedCallback
    // This ensures consistent behavior whether updating via API or DOM
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

  // Clear chart data and reset axes
  clearData() {
    if (this.chart) {
      // Clear the series data
      this.chart.updateSeries([]);

      // Reset x-axis and y-axis to default state
      const defaultAxes = {
        xaxis: {
          tooltip: { enabled: false },
          labels: {}
        },
        yaxis: {
          tooltip: { enabled: false },
          labels: {}
        }
      };

      this.chart.updateOptions(defaultAxes);
    }

    // Clear internal data and reset attributes
    this._data = null;
    this._seriesMap.clear(); // Clear stored series
    this._categories = []; // Clear stored categories
    this._colors = []; // Clear stored colors
    this.removeAttribute('data');
    this.removeAttribute('categories');
  }

  // Add series to memory for runtime management
  addSeries(seriesName, seriesColor, values) {
    const series = {
      name: seriesName,
      data: values,
      color: seriesColor
    };
    this._seriesMap.set(seriesName, series);
  }

  // Add series value to memory (B4X compatible method)
  AddSeriesValue(SeriesName, value) {
    const series = {
      name: SeriesName,
      data: value
    };
    this._seriesMap.set(SeriesName, series);
  }

  // Add XY series (B4X compatible method)
  AddXY(X, y) {
    this.AddSeriesValue(X, y);
  }

  // Set series color (B4X compatible method)
  SetSeriesColor(seriesName, color) {
    if (this._seriesMap.has(seriesName)) {
      const series = this._seriesMap.get(seriesName);
      series.color = color;
      this._seriesMap.set(seriesName, series);
    }
  }

  // Add series category value matrix (B4X compatible method)
  AddSeriesCategoryValue(seriesName, catName, value) {
    let seriesValues = [];
    
    // The series does not exist, create it
    if (!this._seriesMap.has(seriesName)) {
      seriesValues = [];
      // Initialize with empty strings for all categories
      for (let i = 0; i < this._categories.length; i++) {
        seriesValues.push("");
      }
      const series = {
        name: seriesName,
        data: seriesValues
      };
      this._seriesMap.set(seriesName, series);
    }
    
    // Get the series data
    const series = this._seriesMap.get(seriesName);
    seriesValues = series.data;
    
    // What is the category position
    const catPos = this._categories.indexOf(catName);
    if (catPos !== -1) {
      // Update the category value at that position
      seriesValues[catPos] = value;
      series.data = seriesValues;
      // Save the latest series information back
      this._seriesMap.set(seriesName, series);
    }
  }

  // Build options to update during refresh from current attributes
  buildRefreshOptionsFromAttributes() {
    const chartType = this.getAttribute('type') || 'line';
    const options = {};

    // Basic chart options that can be updated (only apply if attribute present)
    const chartAttrPresent = this.hasAttribute('height') || this.hasAttribute('width') || this.hasAttribute('show-toolbar');
    if (chartAttrPresent) {
      options.chart = {};
      if (this.hasAttribute('height')) options.chart.height = parseInt(this.getAttribute('height')) || 350;
      if (this.hasAttribute('width')) options.chart.width = this.getAttribute('width') || '100%';
      if (this.hasAttribute('show-toolbar')) options.chart.toolbar = { show: this.getAttribute('show-toolbar') !== 'false' };
    }

    // Title
    if (this.hasAttribute('title')) {
      options.title = {
        text: this.getAttribute('title') || '',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333'
        }
      };
    }

    // Legend (only set if attributes present to avoid overriding defaults)
    if (this.hasAttribute('show-legend') || this.hasAttribute('legend-position')) {
      options.legend = {
        show: this.getAttribute('show-legend') !== 'false',
        position: this.getAttribute('legend-position') || 'bottom',
        horizontalAlign: 'center',
        verticalAlign: this.getAttribute('legend-position') === 'top' ? 'top' : 'bottom',
        floating: false,
        offsetX: 0,
        offsetY: 0,
        labels: {
          colors: '#333',
          useSeriesColors: false
        }
      };
    }

    // Data labels
    if (this.hasAttribute('show-data-labels')) {
      options.dataLabels = { enabled: this.showDataLabels };
    }

    // Theme (ApexCharts expects an object for theme via updateOptions)
    if (this.hasAttribute('theme')) options.theme = { mode: this.getAttribute('theme') || 'light' };

    // Cartesian chart specific options
    if (['line', 'area', 'bar', 'column', 'scatter'].includes(chartType)) {
      if (this.hasAttribute('x-axis-title') || this.hasAttribute('x-axis-offsety') || this.hasAttribute('x-axis-label-rotate') || this.hasAttribute('x-axis-label-rotate-offsety')) {
        options.xaxis = {};
        if (this.hasAttribute('x-axis-title')) options.xaxis.title = { text: this.getAttribute('x-axis-title') || '' };
        if (this.hasAttribute('x-axis-offsety')) options.xaxis.offsetY = parseInt(this.getAttribute('x-axis-offsety')) || 0;
        if (this.hasAttribute('x-axis-label-rotate') || this.hasAttribute('x-axis-label-rotate-offsety')) {
          options.xaxis.labels = {};
          if (this.hasAttribute('x-axis-label-rotate')) options.xaxis.labels.rotate = parseInt(this.getAttribute('x-axis-label-rotate')) || 0;
          if (this.hasAttribute('x-axis-label-rotate-offsety')) options.xaxis.labels.offsetY = parseInt(this.getAttribute('x-axis-label-rotate-offsety')) || 0;
        }
      }

      if (this.hasAttribute('y-axis-title')) {
        options.yaxis = {};
        options.yaxis.title = { text: this.getAttribute('y-axis-title') || '' };
      }

      // Chart type specific options
      if (chartType === 'line' || chartType === 'area') {
        if (this.hasAttribute('curve') || this.hasAttribute('line-width')) {
          options.stroke = {};
          if (this.hasAttribute('curve')) options.stroke.curve = this.getAttribute('curve') || 'smooth';
          if (this.hasAttribute('line-width')) options.stroke.width = parseInt(this.getAttribute('line-width')) || 3;
        }

        if (chartType === 'area' && this.hasAttribute('gradient')) {
          options.fill = { type: this.getAttribute('gradient') === 'true' ? 'gradient' : 'solid' };
        }
      }

      if (chartType === 'bar' || chartType === 'column') {
        if (this.hasAttribute('bar-orientation') || this.hasAttribute('column-width') || this.hasAttribute('border-radius')) {
          options.plotOptions = { bar: {} };
          if (this.hasAttribute('bar-orientation')) options.plotOptions.bar.horizontal = this.getAttribute('bar-orientation') === 'horizontal';
          if (this.hasAttribute('column-width')) options.plotOptions.bar.columnWidth = this.getAttribute('column-width') || '60%';
          if (this.hasAttribute('border-radius')) options.plotOptions.bar.borderRadius = parseInt(this.getAttribute('border-radius'));
        }

        // Data label orientation for bar/column charts: set only when attribute present
        if (this.hasAttribute('data-label-orientation')) {
          options.plotOptions = options.plotOptions || {};
          options.plotOptions.bar = options.plotOptions.bar || {};
          options.plotOptions.bar.dataLabels = options.plotOptions.bar.dataLabels || {};
          options.plotOptions.bar.dataLabels.orientation = this.getAttribute('data-label-orientation');
        }
        // Data label position for bar/column charts (top/center/bottom)
        if (this.hasAttribute('data-label-position')) {
          options.plotOptions = options.plotOptions || {};
          options.plotOptions.bar = options.plotOptions.bar || {};
          options.plotOptions.bar.dataLabels = options.plotOptions.bar.dataLabels || {};
          options.plotOptions.bar.dataLabels.position = this.getAttribute('data-label-position');
        }

        if (this.getAttribute('stacked') === 'true') {
          if (!options.chart) options.chart = {};
          options.chart.stacked = true;
        }
      }

      if (chartType === 'scatter' && this.hasAttribute('marker-size')) {
        options.markers = { size: parseInt(this.getAttribute('marker-size')) || 6 };
      }
    }

    // Circular chart specific options
    if (['pie', 'donut', 'radialBar'].includes(chartType)) {
      if (this.hasAttribute('start-angle') || this.hasAttribute('end-angle')) {
        options.plotOptions = { pie: {} };
        if (this.hasAttribute('start-angle')) options.plotOptions.pie.startAngle = parseInt(this.getAttribute('start-angle')) || 0;
        if (this.hasAttribute('end-angle')) options.plotOptions.pie.endAngle = parseInt(this.getAttribute('end-angle')) || 360;
      }

      if (chartType === 'donut') {
        if (!options.plotOptions) options.plotOptions = {};
        if (!options.plotOptions.pie) options.plotOptions.pie = {};
        if (!options.plotOptions.pie.donut) options.plotOptions.pie.donut = {};
        if (this.hasAttribute('hollow-size')) options.plotOptions.pie.donut.size = this.getAttribute('hollow-size') || '50%';
        if (this.hasAttribute('donut-show-total')) {
          options.plotOptions.pie.donut.labels = { show: this.getAttribute('donut-show-total') === 'true', total: { show: true, label: 'Total' } };
        }
      }

      if (chartType === 'radialBar') {
        if (!options.plotOptions) options.plotOptions = {};
        if (this.hasAttribute('hollow-size') || this.hasAttribute('track-width') || this.hasAttribute('radial-data-labels') || this.hasAttribute('dashed-radial')) {
          options.plotOptions.radialBar = options.plotOptions.radialBar || {};
          if (this.hasAttribute('hollow-size')) options.plotOptions.radialBar.hollow = { size: this.getAttribute('hollow-size') || '50%' };
          if (this.hasAttribute('track-width')) options.plotOptions.radialBar.track = { show: true, width: parseInt(this.getAttribute('track-width')) || 97 };
          if (this.hasAttribute('radial-data-labels')) options.plotOptions.radialBar.dataLabels = { show: this.getAttribute('radial-data-labels') === 'true' };
          if (this.getAttribute('dashed-radial') === 'true') {
            if (!options.plotOptions.radialBar.track) options.plotOptions.radialBar.track = { show: true };
            options.plotOptions.radialBar.track.strokeWidth = '50%';
          }
        }
      }
    }

    // Realtime settings
    if (this.getAttribute('realtime') === 'true') {
      if (!options.chart) options.chart = {};
      options.chart.animations = { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } };
      options.chart.zoom = { enabled: false };
      if (!options.dataLabels) options.dataLabels = {};
      options.dataLabels.enabled = false; // Disable data labels for realtime
    }

    return options;
  }

  // Refresh chart with all stored series
  refresh() {
    if (this.chart) {
      const chartType = this.getAttribute('type') || 'line';
      
      // Build options to update from current attributes
      const optionsToUpdate = this.buildRefreshOptionsFromAttributes();

      if (chartType === 'pie' || chartType === 'donut' || chartType === 'radialBar') {
        // For circular charts, create specific runtime values
        const runtimeSeriesObjects = Array.from(this._seriesMap.values()).map(series => ({
          name: series.name,
          data: Array.isArray(series.data) ? series.data[0] : series.data,
          color: series.color
        }));

        // Build arrays required by ApexCharts
        const pieSeries = runtimeSeriesObjects.map(s => s.data || 0);
        const pieLabels = runtimeSeriesObjects.map(s => s.name);
        const pieColors = runtimeSeriesObjects.map(s => s.color).filter(Boolean);

        // Set DOM attributes to reflect runtime state (so external code reads current values)
        try {
          const attrData = runtimeSeriesObjects.map(s => ({ name: s.name, data: s.data, color: s.color }));
          if (attrData.length > 0) this.setAttribute('data', JSON.stringify(attrData));
          else this.removeAttribute('data');
        } catch (err) {
          // ignore attribute serialization errors
        }

        if (pieColors.length > 0) {
          try { this.setAttribute('colors', JSON.stringify(pieColors)); } catch(e) {}
        } else {
          try { this.removeAttribute('colors'); } catch(e) {}
        }

        // Debug logging for runtime values
        // Logging removed in production; leave optional debug points if needed
        // Apply to options and series in proper order
        optionsToUpdate.labels = pieLabels;
        if (pieColors.length > 0) optionsToUpdate.colors = pieColors;
        // Apply options first so labels/colors are present before data is updated
        try {
          if (Object.keys(optionsToUpdate).length > 0) this.chart.updateOptions(optionsToUpdate);
          this.chart.updateSeries(pieSeries);
        } catch (err) {
          console.error('Error applying pie refresh updates:', err.message || err, err.stack || 'no stack');
        }
        return; // We've already updated and returned
      } else {
        // For other chart types, convert runtime map to series array
        const runtimeSeriesObjects = Array.from(this._seriesMap.values()).map(series => {
          const data = Array.isArray(series.data) ? series.data.slice() : [series.data];
          return { name: series.name, data: data, color: series.color };
        });

        // Set DOM attributes for integration/consistency
        try {
          if (runtimeSeriesObjects.length > 0) this.setAttribute('data', JSON.stringify(runtimeSeriesObjects));
          else this.removeAttribute('data');
        } catch(e) {}

        // Ensure categories are reflected as attribute as well
        try {
          if (this._categories.length > 0) this.setAttribute('categories', JSON.stringify(this._categories));
          else this.removeAttribute('categories');
        } catch (e) {}

        // Ensure colors attribute reflects runtime
        try {
          if (this._colors.length > 0) this.setAttribute('colors', JSON.stringify(this._colors));
          else this.removeAttribute('colors');
        } catch(e) {}

        // Logging removed in production; leave optional debug points if needed
        // Update options first (xaxis categories, colors) then update series data
        if (this._categories.length > 0) optionsToUpdate.xaxis = { ...optionsToUpdate.xaxis, categories: this._categories };
        if (this._colors.length > 0) optionsToUpdate.colors = this._colors;
        try {
          if (Object.keys(optionsToUpdate).length > 0) this.chart.updateOptions(optionsToUpdate);
          this.chart.updateSeries(runtimeSeriesObjects);
        } catch (err) {
          console.error('Error applying cartesian refresh updates:', err.message || err, err.stack || 'no stack');
        }
        return;
      }

      // Update categories if any are stored (only for cartesian charts)
      if ((chartType !== 'pie' && chartType !== 'donut' && chartType !== 'radialBar') && this._categories.length > 0) {
        optionsToUpdate.xaxis = {
          ...optionsToUpdate.xaxis,
          categories: this._categories
        };
      }

      // Update colors if any are stored
      if (this._colors.length > 0) {
        optionsToUpdate.colors = this._colors;
      }

      // Apply all options updates
      if (Object.keys(optionsToUpdate).length > 0) {
        this.chart.updateOptions(optionsToUpdate);
      }
    }
  }

  // Add a single category to memory
  addCategory(catName) {
    this._categories.push(catName);
  }

  // Add multiple categories to memory
  addCategories(cats) {
    if (Array.isArray(cats)) {
      this._categories.push(...cats);
    }
  }

  // Add colors for series (B4X compatible method)
  AddColors(cols) {
    if (Array.isArray(cols)) {
      this._colors.push(...cols);
    }
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
