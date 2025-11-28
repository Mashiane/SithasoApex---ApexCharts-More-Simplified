# 🎯 SithasoApex: Beautiful Charts Made Simple

**Create stunning, interactive charts with just HTML. No JavaScript required!**

SithasoApex is a lightweight web component that wraps the powerful ApexCharts library, letting you build professional-looking charts using simple HTML attributes. Whether you're a developer looking to add data visualizations to your website or a designer wanting to create dashboards, SithasoApex makes it easy to create beautiful charts without writing complex code.

## ✨Sithaso Apex Demo
[![Sithaso Apex Demo](https://img.youtube.com/vi/PkgprunacBM/0.jpg)](https://youtu.be/PkgprunacBM)

### 🎨 Key Features

- **📱 Responsive**: Charts automatically adapt to different screen sizes
- **⚡ Fast**: Lightweight and optimized for performance
- **🎛️ Interactive**: Built-in tooltips, legends, and zoom functionality
- **🔧 Flexible**: Supports 10+ chart types (line, bar, pie, radar, and more)
- **🚀 Easy**: Just HTML attributes - no JavaScript knowledge required
- **🔄 Dynamic**: Runtime API for live data updates
- **🎯 Customizable**: Full control over colors, themes, and styling

## 🚀 Quick Start

### Step 1: Include the Libraries

Add these scripts to your HTML `<head>`:

```html
<!-- ApexCharts library (required) -->
<script src="https://cdn.jsdelivr.net/npm/apexcharts/dist/apexcharts.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/apexcharts/dist/apexcharts.min.css" rel="stylesheet">

<!-- SithasoApex component -->
<script src="src/SithasoApex.js"></script>
```

### Step 2: Create Your First Chart

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Chart</title>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts/dist/apexcharts.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/apexcharts/dist/apexcharts.min.css" rel="stylesheet">
    <script src="src/SithasoApex.js"></script>
</head>
<body>
    <h1>Website Analytics</h1>

    <sithaso-apex
      id="simple-line-chart"
      type="line"
      title="Website Traffic"
      x-axis-title="Days"
      y-axis-title="Visitors"
      y-axis-output-format="thousand"
      categories='["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]'
      data='[{"name": "Daily Visitors", "data": [1200, 1350, 1180, 1420, 1680, 1890, 2100], "color": "#008FFB"}]'
      height="350px">
    </sithaso-apex>
</body>
</html>
```

That's it! Open this in your browser and you'll see a beautiful line chart showing website traffic data.

### Step 3: Update Charts at Runtime

Want to modify charts dynamically? Use JavaScript to add data and update charts live:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Runtime Chart</title>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts/dist/apexcharts.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/apexcharts/dist/apexcharts.min.css" rel="stylesheet">
    <script src="src/SithasoApex.js"></script>
</head>
<body>
    <h1>Dynamic Website Analytics</h1>

    <sithaso-apex
      id="runtime-line-chart"
      type="line"
      title="Website Traffic (Runtime)"
      x-axis-title="Days"
      y-axis-title="Visitors"
      y-axis-output-format="thousand"
      height="350px">
    </sithaso-apex>

    <div style="margin: 20px 0;">
        <button onclick="initChart()">🔧 Initialize Chart</button>
        <button onclick="updateChart()">📈 Update Data</button>
        <button onclick="clearChart()">🗑️ Clear Chart</button>
    </div>

    <script>
        function initChart() {
            const chart = document.getElementById('runtime-line-chart');
            chart.clear();
            chart.addCategories(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
            chart.addSeries('Daily Visitors', '#008FFB', [1200, 1350, 1180, 1420, 1680, 1890, 2100]);
            chart.refresh();
        }

        function updateChart() {
            const chart = document.getElementById('runtime-line-chart');
            // Add new data point
            const newValue = Math.floor(Math.random() * 1000) + 1500;
            chart.addSeriesPoint('Daily Visitors', newValue);
            chart.refresh();
        }

        function clearChart() {
            const chart = document.getElementById('runtime-line-chart');
            chart.clear();
        }
    </script>
</body>
</html>
```

Click the buttons to initialize the chart, add new data points, or clear everything. This shows how SithasoApex lets you create interactive, dynamic charts!

## 🎯 Basic Usage Examples

Each example below shows two ways to create the same chart:
1. **Static HTML**: Declarative approach using HTML attributes
2. **Runtime JavaScript**: Dynamic approach using the API methods

### 📈 Line Chart

**Static HTML Version:**
```html
<sithaso-apex
  id="my-line-chart"
  type="line"
  title="Website Traffic"
  x-axis-title="Days"
  y-axis-title="Visitors"
  y-axis-output-format="thousand"
  categories='["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]'
  data='[{"name": "Daily Visitors", "data": [1200, 1350, 1180, 1420, 1680, 1890, 2100], "color": "#008FFB"}]'
  height="350px">
</sithaso-apex>
```

**Runtime JavaScript Version:**
```javascript
const chart = document.getElementById('my-line-chart');
chart.clear();
chart.addCategories(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
chart.addSeries('Daily Visitors', '#008FFB', [1200, 1350, 1180, 1420, 1680, 1890, 2100]);
chart.refresh();
```

### 📊 Area Chart

**Static HTML Version:**
```html
<sithaso-apex
  id="my-area-chart"
  type="area"
  title="Monthly Revenue Growth"
  x-axis-title="Months"
  y-axis-title="Revenue ($)"
  y-axis-output-format="money"
  x-axis-label-rotate="45"
  curve="straight"
  categories='["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]'
  data='[{"name": "Revenue", "data": [30, 40, 35, 50, 49, 60, 70, 91, 125], "color": "#008FFB"}]'
  height="300px">
</sithaso-apex>
```

**Runtime JavaScript Version:**
```javascript
const chart = document.getElementById('my-area-chart');
chart.clear();
chart.addCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']);
chart.addSeries('Revenue', '#008FFB', [30, 40, 35, 50, 49, 60, 70, 91, 125]);
chart.refresh();
```

### 📊 Column Chart

**Static HTML Version:**
```html
<sithaso-apex
  id="my-column-chart"
  type="column"
  title="Monthly Revenue"
  x-axis-title="Months"
  y-axis-title="Revenue ($)"
  y-axis-output-format="money"
  x-axis-label-rotate="45"
  column-width="40%"
  data-label-orientation="vertical"
  data-label-position="center"
  categories='["Jan", "Feb", "Mar", "Apr", "May", "Jun"]'
  show-data-labels="false"
  data='[{"name": "Revenue", "data": [1200, 1500, 1800, 2200, 1900, 2500], "color": "#FF4560"}]'
  height="300px">
</sithaso-apex>
```

**Runtime JavaScript Version:**
```javascript
const chart = document.getElementById('my-column-chart');
chart.clear();
chart.addCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
chart.addSeries('Revenue', '#FF4560', [1200, 1500, 1800, 2200, 1900, 2500]);
chart.refresh();
```

### 📊 Bar Chart

**Static HTML Version:**
```html
<sithaso-apex
  id="my-bar-chart"
  type="bar"
  title="Revenue Per Month"
  categories='["Jan", "Feb", "Mar", "Apr", "May"]'
  show-data-labels="false"
  column-width="40%"
  data='[{"name": "Revenue", "data": [100, 120, 140, 160, 180], "color": "#008FFB"}]'
  data-label-position="center"
  x-axis-title="Revenue ($)"
  x-axis-output-format="money"
  x-axis-offsety="20"
  y-axis-title="Months"
  height="350px">
</sithaso-apex>
```

**Runtime JavaScript Version:**
```javascript
const chart = document.getElementById('my-bar-chart');
chart.clear();
chart.addCategories(['Jan', 'Feb', 'Mar', 'Apr', 'May']);
chart.addSeries('Revenue', '#008FFB', [100, 120, 140, 160, 180]);
chart.refresh();
```

### 🥧 Pie Chart

**Static HTML Version:**
```html
<sithaso-apex
  id="my-pie-chart"
  type="pie"
  title="Browser Usage Statistics"
  show-data-labels="false"
  data='[{"name": "Desktop", "data": 44, "color": "#008FFB"}, {"name": "Mobile", "data": 23, "color": "#00E396"}, {"name": "Tablet", "data": 33, "color": "#FEB019"}]'
  options='{"stroke":{"width":6,"colors":["#fff"],"lineCap":"round"}, "plotOptions": {"pie": {"dataLabels": {"offset": 0, "style": {"colors": ["#fff"]}}}}}'
  height="300px">
</sithaso-apex>
```

**Runtime JavaScript Version:**
```javascript
const chart = document.getElementById('my-pie-chart');
chart.clear();
chart.addSeries('Desktop', '#008FFB', 44);
chart.addSeries('Mobile', '#00E396', 23);
chart.addSeries('Tablet', '#FEB019', 33);
chart.refresh();
```

### 🍩 Donut Chart

**Static HTML Version:**
```html
<sithaso-apex
  id="my-donut-chart"
  type="donut"
  title="Browser Market Share"
  show-data-labels="false"
  data='[{"name": "Chrome", "data": 65, "color": "#008FFB"}, {"name": "Firefox", "data": 20, "color": "#00E396"}, {"name": "Safari", "data": 10, "color": "#FEB019"}, {"name": "Other", "data": 5, "color": "#FF4560"}]'
  options='{"stroke":{"width":6,"colors":["#fff"],"lineCap":"round"}}'
  height="300px">
</sithaso-apex>
```

**Runtime JavaScript Version:**
```javascript
const chart = document.getElementById('my-donut-chart');
chart.clear();
chart.addSeries('Chrome', '#008FFB', 65);
chart.addSeries('Firefox', '#00E396', 20);
chart.addSeries('Safari', '#FEB019', 10);
chart.addSeries('Other', '#FF4560', 5);
chart.refresh();
```

### 📍 Scatter Chart

**Static HTML Version:**
```html
<sithaso-apex
  id="my-scatter-chart"
  type="scatter"
  title="Data Correlation Analysis"
  x-axis-title="X Coordinate"
  y-axis-title="Y Coordinate"
  data='[{"name": "Data Points", "data": [[10, 20], [15, 25], [20, 30], [25, 35], [30, 40]], "color": "#008FFB"}]'
  height="300px">
</sithaso-apex>
```

**Runtime JavaScript Version:**
```javascript
const chart = document.getElementById('my-scatter-chart');
chart.clear();
chart.addSeries('Data Points', '#008FFB', [[10, 20], [15, 25], [20, 30], [25, 35], [30, 40]]);
chart.refresh();
```

### 📡 Radar Chart

**Static HTML Version:**
```html
<sithaso-apex
  id="my-radar-chart"
  type="radar"
  title="Radar Comparison"
  x-axis-title="Metrics"
  y-axis-title="Score"
  marker-size="0"
  categories='["Strength", "Speed", "Endurance", "Agility", "Technique", "Luck"]'
  data='[{"name": "Car 1", "data": [80, 50, 30, 40, 100, 20], "color": "#AA00FF"}]'
  height="350px">
</sithaso-apex>
```

**Runtime JavaScript Version:**
```javascript
const chart = document.getElementById('my-radar-chart');
chart.clear();
chart.addCategories(['Strength', 'Speed', 'Endurance', 'Agility', 'Technique', 'Luck']);
chart.addSeries('Car 1', '#AA00FF', [80, 50, 30, 40, 100, 20]);
chart.refresh();
```

## ⚙️ Configuration Attributes

SithasoApex uses HTML attributes to configure your charts. Here's a complete reference of all available attributes:

### 📊 Chart Basics

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `"line"` | Chart type: `line`, `area`, `column`, `bar`, `pie`, `donut`, `radialBar`, `scatter`, `radar`, `polarArea`, `rangeArea` |
| `title` | string | `""` | Main chart title displayed above the chart |
| `subtitle` | string | `""` | Subtitle displayed below the main title |
| `height` | string/number | `"300px"` | Chart container height (e.g., `"400px"` or `400`) |
| `width` | string/number | `"100%"` | Chart container width (e.g., `"100%"` or `600`) |
| `theme` | string | `""` | Chart theme (light, dark, or custom theme name) |

### 🎨 Appearance

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `show-legend` | boolean | `true` | Show/hide the chart legend |
| `legend-position` | string | `"bottom"` | Legend position: `top`, `bottom`, `left`, `right` |
| `show-toolbar` | boolean | `true` | Show/hide zoom and download toolbar |
| `show-data-labels` | boolean | `false` | Show/hide data values on chart elements |
| `data-label-orientation` | string | `""` | Data label orientation: `vertical`, `horizontal` |
| `data-label-position` | string | `""` | Data label position: `center`, `top`, `bottom`, `inside`, etc. |
| `grid-show` | boolean | `true` | Show/hide background grid lines |
| `tooltip-enabled` | boolean | `true` | Enable/disable hover tooltips |
| `marker-size` | number | `6` | Size of data point markers (0 to hide) |

### 📈 Chart-Specific Options

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `curve` | string | `"smooth"` | Line curve style: `smooth`, `straight`, `stepline` |
| `stacked` | boolean | `false` | Stack multiple series on top of each other |
| `bar-orientation` | string | `"vertical"` | Bar chart orientation: `vertical`, `horizontal` |
| `sparkline` | boolean | `false` | Compact chart mode (hides axes, legend, etc.) |
| `gradient` | boolean | `true` | Enable gradient fill for area/bar charts |
| `line-width` | number | `2` | Width of lines in line/area charts |
| `border-radius` | number | `4` | Border radius for bars/columns |
| `column-width` | string | `"70%"` | Width of columns/bars as percentage |
| `realtime` | boolean | `false` | Enable real-time chart updates |

### 📏 Axes & Labels

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `x-axis-title` | string | `""` | X-axis title/label |
| `y-axis-title` | string | `""` | Y-axis title/label |
| `categories` | array | `[]` | X-axis category labels (JSON array) |
| `x-axis-output-format` | string | `"normal"` | X-axis value formatting: `normal`, `money`, `thousand`, `date`, `datetime`, `time` |
| `y-axis-output-format` | string | `"normal"` | Y-axis value formatting (same options as X-axis) |
| `x-axis-offsety` | number | `2` | Y-offset for X-axis title |
| `x-axis-label-rotate` | number | `0` | Rotation angle for X-axis labels (degrees) |
| `x-axis-label-rotate-offsety` | number | `25` | Y-offset for rotated X-axis labels |

### 🥧 Pie/Donut Charts

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `donut-show-total` | boolean | `false` | Show total value in donut center |
| `hollow-size` | string | `"50%"` | Size of donut hole (percentage) |

### 🎯 Radial Bar Charts

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `start-angle` | number | `0` | Start angle in degrees |
| `end-angle` | number | `360` | End angle in degrees |
| `bar-labels` | boolean | `false` | Show labels on radial bars |
| `track-width` | string | `""` | Width of the track background |
| `dashed-radial` | boolean | `false` | Use dashed style for radial bars |

### 📝 Typography

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title-font-size` | string | `"14px"` | Font size for chart title |
| `subtitle-font-size` | string | `"12px"` | Font size for chart subtitle |

### 🔧 Advanced

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `loading` | boolean | `false` | Show loading overlay on chart |
| `options` | object | `{}` | Raw ApexCharts options object (JSON string) |
| `data` | array/object | `[]` | Chart data (JSON string - usually set via runtime API) |

## 🔧 Advanced: Runtime API

Need to update charts dynamically? Use JavaScript to modify charts after creation:

```javascript
// Get chart element
const chart = document.getElementById('my-chart');

// Add new data series
chart.addSeries('New Series', '#FF4560', [100, 200, 150, 300]);

// Add categories
chart.addCategories(['Jan', 'Feb', 'Mar', 'Apr']);

// Apply changes
chart.refresh();
```

### Common Runtime Methods

```javascript
// Clear everything and start fresh
chart.clear();

// Update existing data
chart.updateData([{"name": "Sales", "data": [500, 600, 700]}]);

// Change chart options
chart.updateOptions({chart: {animations: {enabled: false}}});

// Get the underlying ApexCharts instance
const apexChart = chart.getChart();
```

##  Interactive Demo

Want to see SithasoApex in action? Open `src/index.html` in your browser to explore:

- **34 different chart examples**
- Static HTML configurations
- Runtime JavaScript demos
- Interactive controls to modify charts live

Each example shows both the HTML code and the resulting chart, with buttons to randomize data and see real-time updates.

## ❓ Frequently Asked Questions

### Can I use this without JavaScript knowledge?
Yes! SithasoApex is designed for HTML-first development. You can create charts using only HTML attributes.

### Does it work on mobile devices?
Absolutely! Charts are fully responsive and work great on phones and tablets.

### Can I customize the colors?
Yes! Use the `color` property in your data, or set custom colors via the `options` attribute.

### How do I update chart data dynamically?
Use the runtime API methods like `addSeries()`, `updateData()`, and `refresh()`.

### Is ApexCharts included?
No, you need to include ApexCharts separately. It's available via CDN or NPM. Note that ApexCharts uses a dual-license model - review their licensing terms at [https://apexcharts.com/license](https://apexcharts.com/license) to ensure compliance.

### Can I use this in React/Vue/Angular?
Yes! SithasoApex works in any framework that supports web components.

### What's the file size?
The component is very lightweight (~15KB minified). ApexCharts is ~200KB.

## 🛠️ Troubleshooting

### Chart not showing up?
- Make sure ApexCharts is loaded before SithasoApex
- Check that your data format is correct (valid JSON)
- Verify the element has a height set

### Colors not working?
- Colors should be valid CSS color values (#FF0000, rgb(255,0,0), etc.)
- For multiple series, specify colors in the data array

### Performance issues?
- Use `sparkline="true"` for compact charts
- Set `realtime="false"` if you don't need live updates
- Consider using `updateOptions()` instead of recreating charts

## 🌐 Browser Support

SithasoApex works in all modern browsers that support:
- ES6 JavaScript
- Custom Elements v1
- Shadow DOM (optional)

**Supported Browsers:**
- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## 📄 License

SithasoApex is open source and licensed under the MIT License. See package.json for details.

**Note on ApexCharts Dependency:** SithasoApex requires ApexCharts, which uses a dual-license model:

- **Community License (Free):** For individuals, non-profits, educators, and organizations with less than $2M USD annual revenue.
- **Commercial License (Paid):** Required for organizations with $2M+ USD annual revenue or for redistribution in products/platforms.

Please review ApexCharts licensing at [https://apexcharts.com/license](https://apexcharts.com/license) to ensure compliance.

## 🤝 Contributing

Found a bug or want to add a feature? Check out our GitHub repository!

---

**Ready to create beautiful charts?** Start with the Quick Start guide above, then explore the full demo in `src/index.html`. Happy charting! 📊✨