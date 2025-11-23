# SithasoApex Web Component

A professional, easy-to-use web component for creating stunning ApexCharts with simple HTML attributes. Perfect for developers and non-developers alike, this component allows you to create beautiful, interactive charts with minimal code.

## ✨ Features

- 🎯 **Simple HTML attributes** - No JavaScript required for basic charts
- 📱 **Fully responsive** - Charts adapt to all screen sizes automatically
- 🎨 **Rich customization** - Extensive options via JSON attributes
- 🔄 **Real-time updates** - Dynamic data and option changes
- 📊 **10 chart types** - Line, Area, Column, Bar, Pie, Donut, Radial Bar, Scatter, Radar, and Polar Area
- 🚀 **Zero dependencies** - Only requires ApexCharts CDN
- ⚡ **Loading states** - Built-in loading indicators
- 🎪 **Multiple series** - Support for complex data sets
- 📈 **Professional styling** - Clean, modern appearance
- 🔧 **Runtime API** - B4X-style methods for dynamic data manipulation (AddSeriesValue, ClearSeries, etc.)
- 📋 **Data label control** - Attributes for orientation, position, and centering
- 📊 **Stack total centering** - Automatic annotations for stacked chart totals
- 🥧 **Pie label centering** - Centered data labels on pie segments

## 🚀 Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SithasoApex - Simple Line Chart</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    id="simple-line-chart"
    type="line"
    title="Website Traffic"
    x-axis-title="Days"
    y-axis-title="Visitors"
    categories='["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]'
    data='[{"name": "Daily Visitors", "data": [1200, 1350, 1180, 1420, 1680, 1890, 2100], "color": "#008FFB"}]'
    height="350px">
  </sithaso-apex>
</body>
</html>
```

## 🔧 Universal Properties

These properties apply to the component and most chart types. The table below lists every observed attribute (from `src/SithasoApex.js`), its type, the default value used by the code, which chart types reference it, and a short description.

| Attribute Name | Type | Default Value | Chart Type | Description |
|---------------|------|---------------|------------|-------------|
| `type` | string | `"line"` | All | Chart type selector. Changing this attribute recreates the internal ApexCharts instance. Accepted values: `line`, `area`, `column`, `bar`, `pie`, `donut`, `radialBar`, `scatter`, `radar`, `polarArea`. |
| `data` | JSON string | Required | All | Primary chart data. Accepted formats: object maps (e.g. `{"Jan":10}`), array-of-arrays (e.g. `[["Jan",10]]`), or series arrays (e.g. `[{"name":"S1","data":{"Jan":10}}]`). The component attempts `JSON.parse`; invalid JSON logs an error. See the Data Formats section for examples and chart-specific notes (pie/donut allow number arrays). |
| `options` | JSON string | `{}` | All | Raw ApexCharts options merged with the component's defaults. Use to set nested `plotOptions`, `annotations`, or other Apex-specific settings. When merging, nested objects are replaced unless fully provided. Note: `radar` and `polarArea` creators perform a deep-merge for nested options to avoid accidentally removing required nested defaults (the component also enforces `chart.type` after merging). For other chart types nested objects may be shallow-merged — prefer passing complete nested objects or using the component API when in doubt. |
| `height` | string | `350` (Apex default) / container fallback `300px` | All | Chart height. Accepts CSS units like `350px` or `40vh`. If omitted, Apex's default (350) is used; container CSS may override. |
| `width` | string | `"100%"` | All | Chart width (CSS value). The chart remains responsive by default. |
| `theme` | string | `null` | All | Attribute present in observedAttributes but not actively mapped — pass theme via `options.theme` for reliable behavior. |
| `loading` | boolean string | `null` | All | Set to `"true"` to show a loading state and disable interactions. Any non-empty value is treated as truthy. |
| `show-legend` | boolean string | auto (true for multi-series) | All | Show or hide legend. The component shows the legend automatically for multi-series datasets; use `"false"` to hide. |
| `legend-position` | string | `"bottom"` | All | Legend position: `top`, `bottom`, `left`, `right`. Ignore casing. |
| `show-toolbar` | boolean string | `"true"` | All | Toggle ApexCharts toolbar (export/zoom controls). |
| `title` | string | `""` | All | Chart title text. Prefer `options.title` for advanced styling. |
| `show-data-labels` | boolean string | `"false"` | All | Toggle display of data labels. For dense series or realtime charts, prefer disabling (`"false"`). |
| `data-label-orientation` | string | `"auto"` | All | Orientation of data labels: `horizontal`, `vertical`, `auto`. |
| `data-label-position` | string | `"center"` | All | Position of data labels: `center`, `top`, `bottom`, `left`, `right`. |
| `stack-total-center` | boolean string | `"false"` | Column, Bar | For stacked charts, show total values centered on each stack using annotations. |
| `x-axis-title` | string | `""` | Line, Area, Column, Bar, Scatter | X-axis title text. For horizontal bars this becomes the numeric axis title. |
| `y-axis-title` | string | `""` | Line, Area, Column, Bar, Scatter | Y-axis title text. For horizontal bars this becomes the category axis title. |
| `bar-orientation` | string | `"vertical"` | Column, Bar | Orientation for bar/column plots: `vertical` (columns) or `horizontal` (bars). Use alongside `categories`. |
| `curve` | string | `"smooth"` | Line, Area | Curve style: `smooth`, `straight`, or `stepline`. Note: `stepline` requires ordered categories for expected step transitions. |
| `line-width` | string | `3` | Line, Area | Stroke width in pixels for line/area charts. Numeric strings parsed with `parseInt`. |
| `categories` | JSON string | `[]` | Line, Area, Column, Bar | Category labels as a JSON array. For horizontal `bar` charts this array maps to the Y-axis (categories). When omitted and `data` is an object, keys are used as categories. |
| `donut-show-total` | boolean string | `"true"` | Donut | Show aggregated total in the donut centre. Set to `"false"` to hide. |
| `hollow-size` | string | `"50%"` | Donut, RadialBar | Hollow center size (percent or px e.g. `70%` or `100px`). RadialBar accepts same values via `options` as well. |
| `dashed-radial` | boolean string | `"false"` | RadialBar | When `"true"`, radial bars render with a dashed stroke. |
| `track-width` | string | `"97%"` | RadialBar | Track/stroke width for radial bars (percent or px). |
| `bar` | string | `null` | (none — unused) | Present in `observedAttributes` for backwards compatibility; the implementation currently ignores it. Prefer passing `type="bar"`. |
| `x-axis-offsety` | string | `"2"` | Line, Area, Column, Bar, Scatter | Vertical offset (pixels) for the X-axis title or rotated label adjustments. Can be negative. |
| `x-axis-label-rotate` | string | `"0"` | Line, Area, Column, Bar, Scatter | Rotate X-axis labels by degrees (e.g. `45` or `90`) to improve readability for long labels. |
| `x-axis-label-rotate-offsety` | string | `"25"` | Line, Area, Column, Bar, Scatter | Extra Y offset (pixels) applied when labels are rotated to avoid collisions. |
| `gradient` | boolean string | `"true"` (applies when attribute value is not `"false"`) | Most charts | Apply gradient fills. The component treats any value other than the literal string `"false"` as enabling gradients. To force no gradient set `gradient="false"` or control fills via `options.fill`. |
| `realtime` | boolean string | `"false"` | Line, Area, Column, Bar, Pie, Donut, RadialBar, Scatter | Enable realtime mode. In realtime the component adjusts animations, may disable markers/data-labels for performance, and expects streaming updates via `updateData` or via the `chart.chart.updateSeries` on the underlying Apex instance. Use `options.xaxis.type = 'datetime'` for time-based streams. |
| `marker-size` | string | `6` | Line, Area, Scatter | Marker diameter in pixels for scatter/line/area charts. Use smaller values for dense datasets; realtime mode may override marker visibility.

## 🔧 Runtime API Methods

The SithasoApex component provides B4X-style runtime methods for dynamic data manipulation. These methods allow you to add, clear, and update series data programmatically.

### Available Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `addSeriesValue(seriesName, value, category?)` | `seriesName` (string): Name of the series<br>`value` (number): Value to add<br>`category` (string, optional): Category for the value | Adds a single value to the specified series. If category is provided, adds to that category; otherwise, appends to the end. |
| `clearSeries(seriesName?)` | `seriesName` (string, optional): Name of the series to clear | Clears all data from the specified series, or all series if no name provided. |
| `updateSeries(seriesName, data)` | `seriesName` (string): Name of the series<br>`data` (array): New data array | Replaces the data for the specified series. |
| `getSeriesData(seriesName)` | `seriesName` (string): Name of the series | Returns the current data array for the specified series. |
| `setSeriesColor(seriesName, color)` | `seriesName` (string): Name of the series<br>`color` (string): Color value | Sets the color for the specified series. |
| `removeSeries(seriesName)` | `seriesName` (string): Name of the series | Removes the specified series from the chart. |

### Example Usage

```javascript
const chart = document.querySelector('sithaso-apex');

// Add a value to an existing series
chart.addSeriesValue('Revenue', 1500, 'Jun');

// Clear all series
chart.clearSeries();

// Update entire series data
chart.updateSeries('Sales', [100, 200, 300, 400]);

// Get current data
const data = chart.getSeriesData('Revenue');
console.log(data); // [1200, 1350, 1180, ...]
```

## 📊 Supported Chart Types

SithasoApex supports the following chart types:

### Line Charts
Line charts display data points connected by straight lines, ideal for showing trends over time or continuous data.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `x-axis-title` | string | `""` | X-axis title text. When `categories` are provided these labels map to data points; for datetime series prefer `options.xaxis.type = 'datetime'`. |
| `y-axis-title` | string | `""` | Y-axis title text. Use `options.yaxis` to set multiple Y axes or custom formatting. |
| `curve` | string | `"smooth"` | Line curve style: `smooth`, `straight`, `stepline`. `stepline` requires ordered categories to create correct step transitions. |
| `line-width` | string | `"3"` | Stroke width in pixels. Parsed as integer. |
| `categories` | JSON string | `[]` | Category labels array. If omitted and `data` is an object, keys from the data object are used as categories. For time-series use datetime values via `options`. |
| `marker-size` | string | `"6"` | Marker diameter in pixels. For dense datasets reduce size or hide markers with CSS or via `show-data-labels`. Realtime mode may hide markers for performance. |
| `gradient` | boolean string | `"false"` | Enable gradient fills. Any value other than the literal `"false"` enables gradients; to customize, pass `options.fill`. |
| `realtime` | boolean string | `"false"` | Realtime mode adjusts animations and disables heavy visuals (markers/data-labels) for performance. Use with streaming updates and a datetime x-axis when appropriate. |
| `x-axis-offsety` | string | `"2"` | Vertical offset (pixels) for X-axis title or rotated labels. Can be negative. |
| `x-axis-label-rotate` | string | `"0"` | Rotation in degrees for X-axis labels to improve readability on long labels. |
| `x-axis-label-rotate-offsety` | string | `"25"` | Extra Y offset (pixels) applied when labels are rotated to avoid collisions. |
| `show-data-labels` | boolean string | `"false"` | Toggle data labels on line points. |
| `data-label-orientation` | string | `"auto"` | Orientation for data labels. |
| `data-label-position` | string | `"center"` | Position for data labels. |

### Example

```html
<!DOCTYPE html>
<html lang="en">
## 🧾 Demo Page & Examples

- The `src/index.html` demo includes pretty-printed, syntax-highlighted code examples (Prism.js) and copy-to-clipboard buttons for each `sithaso-apex` example. Examples are auto-generated from the live `sithaso-apex` elements so they reflect the attributes used in the demo.
- Code blocks wrap long lines and use vertical scrolling when tall; copy buttons use Prism's toolbar plugin with a robust JS fallback for older browsers.
<head>
  <meta charset="UTF-8">
  <title>SithasoApex - Line Chart (Multiple Series)</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    id="line-chart"
    type="line"
    title="Monthly Revenue Growth"
    x-axis-title="Months"
    y-axis-title="Revenue ($)"
    x-axis-label-rotate="45"
    x-axis-offsety="-15"
    categories='["Jan", "Feb", "Mar", "Apr", "May"]'
    data='[{"name": "Revenue", "data": [100, 120, 140, 160, 180], "color": "#008FFB"}, {"name": "Target", "data": [110, 130, 135, 155, 175], "color": "#00E396"}]'
    height="400px">
  </sithaso-apex>
</body>
</html>
```

### Area Charts
Area charts are similar to line charts but fill the area under the lines, emphasizing magnitude and trends.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `x-axis-title` | string | `""` | X-axis title text. Works same as in Line charts; for stacked/negative area charts ensure categories align with series lengths. |
| `y-axis-title` | string | `""` | Y-axis title text. For area charts with negative values Apex will auto-extend axis; use `options.yaxis` to control range. |
| `curve` | string | `"smooth"` | Curve style: `smooth`, `straight`, `stepline`. For smooth area gradients, ensure `gradient` is enabled. |
| `categories` | JSON string | `[]` | Categories array. If data is provided as keyed objects, keys are used as categories automatically. |
| `marker-size` | string | `"6"` | Marker diameter in pixels. Hides automatically in some stacked area visualizations for clarity. |
| `gradient` | boolean string | `"false"` | Enable gradient fills under the curve. For multi-series stacked areas, gradients are applied per series. |
| `realtime` | boolean string | `"false"` | Realtime mode optimizes animations for streaming updates. Use `options.xaxis.type = 'datetime'` for correct time handling. |
| `x-axis-offsety` | string | `"2"` | Vertical offset for X-axis title/labels; useful when labels are rotated. |
| `x-axis-label-rotate` | string | `"0"` | Rotate X-axis labels; see `x-axis-label-rotate-offsety` when rotated labels collide. |
| `x-axis-label-rotate-offsety` | string | `"25"` | Offset for rotated labels to avoid overlap. |
| `show-data-labels` | boolean string | `"false"` | Toggle data labels. |
| `data-label-orientation` | string | `"auto"` | Orientation for data labels. |
| `data-label-position` | string | `"center"` | Position for data labels. |

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SithasoApex - Area Chart (Basic)</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="area"
    title="Monthly Revenue Growth"
    x-axis-title="Months"
    y-axis-title="Revenue ($)"
    x-axis-label-rotate="45"
    curve="straight"
    categories='["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]'
    data='[{"name": "Revenue", "data": [30, 40, 35, 50, 49, 60, 70, 91, 125], "color": "#008FFB"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

### Column Charts
Column charts use vertical bars to compare values across categories, excellent for showing comparisons.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `x-axis-title` | string | `""` | X-axis title text. For column charts represents the category axis. |
| `y-axis-title` | string | `""` | Y-axis title text. For column charts represents the numeric axis. |
| `categories` | JSON string | `[]` | Category labels array (must match series length). If omitted and `data` is object-mapped, keys become categories. |
| `gradient` | boolean string | `"false"` | Enable gradient fills for columns. For large datasets turning off gradients improves rendering performance. |
| `realtime` | boolean string | `"false"` | Enable realtime-mode behavior for streaming column updates. Keep `show-data-labels` off for large streaming series. |
| `x-axis-offsety` | string | `"2"` | Vertical offset for X-axis title and rotated labels. |
| `x-axis-label-rotate` | string | `"0"` | Rotate X-axis labels to prevent overlap for long labels. |
| `x-axis-label-rotate-offsety` | string | `"25"` | Vertical offset when labels are rotated. |
| `bar-orientation` | string | `"vertical"` | Set `horizontal` to flip axes and render bars horizontally (useful for long category names). When horizontal, `x-axis-title` refers to the numeric axis. |
| `show-data-labels` | boolean string | `"false"` | Toggle data labels on columns. |
| `data-label-orientation` | string | `"auto"` | Orientation for data labels. |
| `data-label-position` | string | `"center"` | Position for data labels. |
| `stack-total-center` | boolean string | `"false"` | For stacked columns, display total values centered on each stack using annotations. |

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SithasoApex - Column Chart</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="column"
    title="Monthly Revenue"
    x-axis-title="Months"
    y-axis-title="Revenue ($)"
    x-axis-label-rotate="45"
    categories='["Jan", "Feb", "Mar", "Apr", "May", "Jun"]'
    data='[{"name": "Revenue", "data": [1200, 1500, 1800, 2200, 1900, 2500], "color": "#FF4560"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

### Bar Charts
Bar charts use horizontal bars for comparisons, similar to columns but oriented horizontally.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `x-axis-title` | string | `""` | Numeric axis title for bar charts (when horizontal). |
| `y-axis-title` | string | `""` | Category axis title for bar charts. |
| `categories` | JSON string | Required for bars | Categories array for the categorical (vertical) axis. For grouped bars provide same-length arrays per series. |
| `gradient` | boolean string | `"false"` | Apply gradient to bars; set `"false"` to disable. For dense bars prefer disabling for speed. |
| `x-axis-offsety` | string | `"2"` | Vertical offset for axis title and rotated label adjustments. |
| `x-axis-label-rotate` | string | `"0"` | Rotation degrees for labels (applies when labels are rendered horizontally). |
| `x-axis-label-rotate-offsety` | string | `"25"` | Vertical offset for rotated labels. |
| `show-data-labels` | boolean string | `"false"` | Toggle data labels on bars. |
| `data-label-orientation` | string | `"auto"` | Orientation for data labels. |
| `data-label-position` | string | `"center"` | Position for data labels. |
| `stack-total-center` | boolean string | `"false"` | For stacked bars, display total values centered on each stack using annotations. |

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bar Chart Example</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="bar"
    title="Revenue Per Month"
    type="bar"
    categories='["Jan", "Feb", "Mar", "Apr", "May"]'
    data='[{"name": "Revenue", "data": [100, 120, 140, 160, 180], "color": "#008FFB"}]'
    x-axis-title="Revenue ($)"
    x-axis-offsety="20"
    y-axis-title="Months"
    height="350px">
  </sithaso-apex>
</body>
</html>
```

### Pie Charts
Pie charts show proportions of a whole using slices, perfect for percentage breakdowns.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `gradient` | boolean string | `"false"` | Apply gradient fills to slices. To customize individual slice colors provide `color` in each data object or use `options.colors`. Accepts either `[[label, value], ...]`, numeric arrays, or series objects. When passing numeric arrays, order maps directly to labels (if `categories` provided) or to the series order. |
| `show-data-labels` | boolean string | `"false"` | Toggle data labels on pie slices. |
| `data-label-orientation` | string | `"auto"` | Orientation for data labels. |
| `data-label-position` | string | `"center"` | Position for data labels; for pie charts, `"center"` places labels on the segments. |

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pie Chart Example</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="pie"
    title="Browser Usage Statistics"
    data='[{"name": "Desktop", "data": 44, "color": "#008FFB"}, {"name": "Mobile", "data": 23, "color": "#00E396"}, {"name": "Tablet", "data": 33, "color": "#FEB019"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

### Donut Charts
Donut charts are similar to pie charts but with a hollow center, often used for displaying totals.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `donut-show-total` | boolean string | `"true"` | Show aggregated total in the donut centre. Set to `"false"` to hide. For custom formatting use `options.formatter` inside donut `plotOptions`. |
| `gradient` | boolean string | `"false"` | Apply gradients to donut slices. To fully control appearance use `options.fill` or `options.colors`. |
| `show-data-labels` | boolean string | `"false"` | Toggle data labels on donut slices. |
| `data-label-orientation` | string | `"auto"` | Orientation for data labels. |
| `data-label-position` | string | `"center"` | Position for data labels. |

#### HTML Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donut Chart Example</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="donut"
    title="Browser Market Share"
    data='[{"name": "Chrome", "data": 65, "color": "#008FFB"}, {"name": "Firefox", "data": 20, "color": "#00E396"}, {"name": "Safari", "data": 10, "color": "#FEB019"}, {"name": "Other", "data": 5, "color": "#FF4560"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

### Radial Bar Charts
Radial bar charts display data in circular bars, great for gauges and KPIs.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `hollow-size` | string | `"50%"` | Hollow center size; accepts percentages (`70%`) or pixel values (`100px`). When using `options.plotOptions.radialBar.hollow` provide matching values. |
| `track-width` | string | `"97%"` | Track/stroke width for radial bars. Percent or px accepted. |
| `dashed-radial` | boolean string | `"false"` | When `"true"`, radial bars render with a dashed stroke. Works best for single-series gauge-like charts. |
| `gradient` | boolean string | `"false"` | Enable gradient fill for radial bars; to tune colors use `options.colors`. |
| `show-data-labels` | boolean string | `"false"` | Toggle data labels on radial bars. |
| `data-label-orientation` | string | `"auto"` | Orientation for data labels. |
| `data-label-position` | string | `"center"` | Position for data labels. |

#### HTML Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Radial Bar Example</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="radialBar"
    data='[{"name": "Progress", "data": 70, "color": "#008FFB"}, {"name": "Score", "data": 80, "color": "#00E396"}, {"name": "Rating", "data": 90, "color": "#FEB019"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

### Scatter Charts
Scatter charts plot points on a grid to show relationships between two variables.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `x-axis-title` | string | `""` | X-axis title text. For numeric scatter data, ensure pairs are `[x,y]` numeric values. |
| `y-axis-title` | string | `""` | Y-axis title text. |
| `marker-size` | string | `"6"` | Marker diameter in pixels. Increase for emphasis or decrease for dense point clouds. |
| `gradient` | boolean string | `"false"` | Gradient does not typically apply to scatter markers; use `options.colors` and `marker` settings for per-point styling. |
| `realtime` | boolean string | `"false"` | Realtime mode supports streaming XY pairs; prefer disabling heavy marker styles when streaming. |
| `x-axis-offsety` | string | `"2"` | Vertical offset for X-axis title and rotated labels. |
| `x-axis-label-rotate` | string | `"0"` | Rotate X-axis labels when numeric labels are long or formatted strings. |
| `x-axis-label-rotate-offsety` | string | `"25"` | Offset for rotated labels. |
| `show-data-labels` | boolean string | `"false"` | Toggle data labels on scatter points. |
| `data-label-orientation` | string | `"auto"` | Orientation for data labels. |
| `data-label-position` | string | `"center"` | Position for data labels. |

#### HTML Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scatter Demo (Index)</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="scatter"
    title="Data Correlation Analysis"
    x-axis-title="X Coordinate"
    y-axis-title="Y Coordinate"
    data='[{"name": "Data Points", "data": [[10, 20], [15, 25], [20, 30], [25, 35], [30, 40]], "color": "#008FFB"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

## 📋 Data Formats

### Simple Object Format
```html
<sithaso-apex data='{"January": 100, "February": 120}'></sithaso-apex>
```

### Array Format
```html
<sithaso-apex data='[["January", 100], ["February", 120]]'></sithaso-apex>
```

### Multiple Series
```html
<sithaso-apex data='[
  {"name": "Sales", "data": {"Jan": 100, "Feb": 120}},
  {"name": "Revenue", "data": {"Jan": 80, "Feb": 95}}
]'></sithaso-apex>
```

### Pie Chart Format
```html
<sithaso-apex type="pie" data='[["Apples", 44], ["Bananas", 23]]'></sithaso-apex>
```

## 🎨 Advanced Customization

Use the `options` attribute for full ApexCharts customization:

```html
<sithaso-apex
  type="line"
  data='{"Jan": 100, "Feb": 120, "Mar": 140}'
  options='{
    "colors": ["#FF4560", "#00E396"],
    "stroke": {"width": 3, "curve": "smooth"},
    "fill": {"type": "gradient"},
    "grid": {"show": false},
    "tooltip": {"theme": "dark"}
  }'
  height="400">
</sithaso-apex>
```

## 🔧 JavaScript API

For dynamic interactions, use JavaScript:

```javascript
const chart = document.querySelector('sithaso-apex');

// Update data
chart.data = {"Apr": 160, "May": 180};

// Update options
chart.options = {"title": {"text": "Updated Chart"}};

// Get chart instance
const apexInstance = chart.chart;

// Show loading
chart.loading = true;

// Runtime API methods
chart.addSeriesValue('Revenue', 1500, 'Jun');
chart.clearSeries();
chart.updateSeries('Sales', [100, 200, 300]);
```

## 📱 Responsive Design

All charts automatically adapt to different screen sizes with optimized layouts for mobile devices.

## 🛠️ Troubleshooting

- **Charts not displaying**: Ensure ApexCharts script is loaded before the component
- **Invalid data**: Check console for JSON parsing errors
- **Styling issues**: Charts inherit container styles; adjust height/width as needed

## 📄 Examples

Open `index.html` in your browser to see all chart types with various configurations.

## 📄 License

MIT License - Free to use for personal and commercial projects.

---

## 📂 Canonical Examples (from `src/index.html`)

The snippets below are copied verbatim from `src/index.html` so you can copy-paste them exactly as working examples.

```html
<!-- Realtime Line Chart -->
<sithaso-apex
  id="realtime-chart"
  type="line"
  title="Dynamic Updating Chart"
  x-axis-title="Time"
  y-axis-title="Value"
  realtime="true"
  options='{"xaxis": { "type": "datetime", "range": 777600000}}'
  height="350px">
</sithaso-apex>

<!-- Step Line Chart -->
<sithaso-apex
  type="line"
  title="Temperature Changes"
  x-axis-title="Time"
  y-axis-title="Temperature (°C)"
  curve="stepline"
  categories='["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"]'
  data='[{"name": "Temperature", "data": [15, 15, 22, 22, 28, 28, 18], "color": "#00E396"}]'
  height="350px">
</sithaso-apex>

<!-- Dashed Line Chart -->
<sithaso-apex
  type="line"
  title="Project Progress"
  x-axis-title="Weeks"
  y-axis-title="Completion (%)"
  categories='["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"]'
  data='[{"name": "Planned", "data": [10, 25, 40, 60, 75, 90, 100], "color": "#FEB019", "dashed": true}, {"name": "Actual", "data": [30, 67, 70, 90, 100, 160, 150], "color": "#FF4560", "dashed": true}]'
  height="350px">
</sithaso-apex>

<!-- Radial Bar (hollow size + dashed) -->
<sithaso-apex
  type="radialBar"
  data='[{"name": "Cricket", "data": 70, "color": "#008FFB"}]'
  hollow-size="70%"
  dashed-radial="true"
  height="350px">
</sithaso-apex>

<!-- Horizontal Bar Grouped -->
<sithaso-apex
  type="bar"
  title="Monthly Revenue Growth"
  x-axis-title="Revenue vs Target"
  y-axis-title="Month"
  categories='["Jan", "Feb", "Mar", "Apr", "May"]'
  data='[{"name": "Revenue", "data": [100, 120, 140, 160, 180], "color": "#008FFB"}, {"name": "Target", "data": [110, 130, 135, 155, 175], "color": "#00E396"}]'
  height="400px">
</sithaso-apex>

<!-- Dynamic Options Demo (buttons + dynamic chart element) -->
<div>
  <div style="margin-bottom: 15px; color: #666;">Click the buttons below to dynamically update chart options using the setter:</div>
  <div style="margin-bottom: 10px;">
    <button onclick="toggleTheme()">🌓 Toggle Theme</button>
    <button onclick="changeChartColors()">🎨 Colors</button>
    <button onclick="updateChartTitle()">📝 Title</button>
    <button onclick="toggleDataLabels()">🏷️ Labels</button>
    <button onclick="resetChartOptions()">🔄 Reset</button>
  </div>
  <sithaso-apex
    id="dynamic-chart"
    type="bar"
    title="Dynamic Options Demo"
    x-axis-title="Categories"
    y-axis-title="Values"
    data='[{"name": "Series 1", "data": {"A": 10, "B": 20, "C": 30, "D": 40}}]'
    height="350px">
  </sithaso-apex>
</div>

<!-- Stacked Column with Total Centering -->
<sithaso-apex
  type="column"
  title="Stacked Revenue"
  x-axis-title="Months"
  y-axis-title="Revenue ($)"
  categories='["Jan", "Feb", "Mar"]'
  data='[{"name": "Product A", "data": [100, 120, 140]}, {"name": "Product B", "data": [80, 90, 110]}]'
  options='{"plotOptions": {"bar": {"horizontal": false}}, "chart": {"stacked": true}}'
  stack-total-center="true"
  height="350px">
</sithaso-apex>

<!-- Pie Chart with Centered Labels -->
<sithaso-apex
  type="pie"
  title="Market Share"
  data='[{"name": "Segment A", "data": 40}, {"name": "Segment B", "data": 30}, {"name": "Segment C", "data": 30}]'
  options='{"plotOptions": {"pie": {"dataLabels": {"offset": 0}}}}'
  show-data-labels="true"
  data-label-position="center"
  height="350px">
</sithaso-apex>
```

---

**Created with ❤️ for easy, beautiful charts**

---

## CI / Puppeteer Test

This repository includes headless Puppeteer tests that validate specific features like stack totals and pie label centering. The tests are run in CI via GitHub Actions (`.github/workflows/puppeteer.yml`).

Run tests locally:

```powershell
npm install
npm run test:puppeteer
```

Badge (replace `<OWNER>` and `<REPO>` with your GitHub account and repository name):

```markdown
![Puppeteer tests](https://github.com/<OWNER>/<REPO>/actions/workflows/puppeteer.yml/badge.svg)
```

If you prefer CI to use a system-installed Chrome instead of downloading Chromium during `npm install`, set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` in CI and install Chrome in the runner, or modify the workflow to install Chrome before `npm ci`.

## 📊 Supported Chart Types

SithasoApex supports the following chart types:

### Line Charts
Line charts display data points connected by straight lines, ideal for showing trends over time or continuous data.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `x-axis-title` | string | `""` | X-axis title text. When `categories` are provided these labels map to data points; for datetime series prefer `options.xaxis.type = 'datetime'`. |
| `y-axis-title` | string | `""` | Y-axis title text. Use `options.yaxis` to set multiple Y axes or custom formatting. |
| `curve` | string | `"smooth"` | Line curve style: `smooth`, `straight`, `stepline`. `stepline` requires ordered categories to create correct step transitions. |
| `line-width` | string | `"3"` | Stroke width in pixels. Parsed as integer. |
| `categories` | JSON string | `[]` | Category labels array. If omitted and `data` is an object, keys from the data object are used as categories. For time-series use datetime values via `options`. |
| `marker-size` | string | `"6"` | Marker diameter in pixels. For dense datasets reduce size or hide markers with CSS or via `show-data-labels`. Realtime mode may hide markers for performance. |
| `gradient` | boolean string | `"false"` | Enable gradient fills. Any value other than the literal `"false"` enables gradients; to customize, pass `options.fill`. |
| `realtime` | boolean string | `"false"` | Realtime mode adjusts animations and disables heavy visuals (markers/data-labels) for performance. Use with streaming updates and a datetime x-axis when appropriate. |
| `x-axis-offsety` | string | `"2"` | Vertical offset (pixels) for X-axis title or rotated labels. Can be negative. |
| `x-axis-label-rotate` | string | `"0"` | Rotation in degrees for X-axis labels to improve readability on long labels. |
| `x-axis-label-rotate-offsety` | string | `"25"` | Extra Y offset (pixels) applied when labels are rotated to avoid collisions. |

### Example

```html
<!DOCTYPE html>
<html lang="en">
## 🧾 Demo Page & Examples

- The `src/index.html` demo includes pretty-printed, syntax-highlighted code examples (Prism.js) and copy-to-clipboard buttons for each `sithaso-apex` example. Examples are auto-generated from the live `sithaso-apex` elements so they reflect the attributes used in the demo.
- Code blocks wrap long lines and use vertical scrolling when tall; copy buttons use Prism's toolbar plugin with a robust JS fallback for older browsers.
<head>
  <meta charset="UTF-8">
  <title>SithasoApex - Line Chart (Multiple Series)</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    id="line-chart"
    type="line"
    title="Monthly Revenue Growth"
    x-axis-title="Months"
    y-axis-title="Revenue ($)"
    x-axis-label-rotate="45"
    x-axis-offsety="-15"
    categories='["Jan", "Feb", "Mar", "Apr", "May"]'
    data='[{"name": "Revenue", "data": [100, 120, 140, 160, 180], "color": "#008FFB"}, {"name": "Target", "data": [110, 130, 135, 155, 175], "color": "#00E396"}]'
    height="400px">
  </sithaso-apex>
</body>
</html>
```

### Area Charts
Area charts are similar to line charts but fill the area under the lines, emphasizing magnitude and trends.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `x-axis-title` | string | `""` | X-axis title text. Works same as in Line charts; for stacked/negative area charts ensure categories align with series lengths. |
| `y-axis-title` | string | `""` | Y-axis title text. For area charts with negative values Apex will auto-extend axis; use `options.yaxis` to control range. |
| `curve` | string | `"smooth"` | Curve style: `smooth`, `straight`, `stepline`. For smooth area gradients, ensure `gradient` is enabled. |
| `categories` | JSON string | `[]` | Categories array. If data is provided as keyed objects, keys are used as categories automatically. |
| `marker-size` | string | `"6"` | Marker diameter in pixels. Hides automatically in some stacked area visualizations for clarity. |
| `gradient` | boolean string | `"false"` | Enable gradient fills under the curve. For multi-series stacked areas, gradients are applied per series. |
| `realtime` | boolean string | `"false"` | Realtime mode optimizes animations for streaming updates. Use `options.xaxis.type = 'datetime'` for correct time handling. |
| `x-axis-offsety` | string | `"2"` | Vertical offset for X-axis title/labels; useful when labels are rotated. |
| `x-axis-label-rotate` | string | `"0"` | Rotate X-axis labels; see `x-axis-label-rotate-offsety` when rotated labels collide. |
| `x-axis-label-rotate-offsety` | string | `"25"` | Offset for rotated labels to avoid overlap. |

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SithasoApex - Area Chart (Basic)</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="area"
    title="Monthly Revenue Growth"
    x-axis-title="Months"
    y-axis-title="Revenue ($)"
    x-axis-label-rotate="45"
    curve="straight"
    categories='["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]'
    data='[{"name": "Revenue", "data": [30, 40, 35, 50, 49, 60, 70, 91, 125], "color": "#008FFB"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

### Column Charts
Column charts use vertical bars to compare values across categories, excellent for showing comparisons.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `x-axis-title` | string | `""` | X-axis title text. For column charts represents the category axis. |
| `y-axis-title` | string | `""` | Y-axis title text. For column charts represents the numeric axis. |
| `categories` | JSON string | `[]` | Category labels array (must match series length). If omitted and `data` is object-mapped, keys become categories. |
| `gradient` | boolean string | `"false"` | Enable gradient fills for columns. For large datasets turning off gradients improves rendering performance. |
| `realtime` | boolean string | `"false"` | Enable realtime-mode behavior for streaming column updates. Keep `show-data-labels` off for large streaming series. |
| `x-axis-offsety` | string | `"2"` | Vertical offset for X-axis title and rotated labels. |
| `x-axis-label-rotate` | string | `"0"` | Rotate X-axis labels to prevent overlap for long labels. |
| `x-axis-label-rotate-offsety` | string | `"25"` | Vertical offset when labels are rotated. |
| `bar-orientation` | string | `"vertical"` | Set `horizontal` to flip axes and render bars horizontally (useful for long category names). When horizontal, `x-axis-title` refers to the numeric axis. |

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SithasoApex - Column Chart</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="column"
    title="Monthly Revenue"
    x-axis-title="Months"
    y-axis-title="Revenue ($)"
    x-axis-label-rotate="45"
    categories='["Jan", "Feb", "Mar", "Apr", "May", "Jun"]'
    data='[{"name": "Revenue", "data": [1200, 1500, 1800, 2200, 1900, 2500], "color": "#FF4560"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

### Bar Charts
Bar charts use horizontal bars for comparisons, similar to columns but oriented horizontally.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `x-axis-title` | string | `""` | Numeric axis title for bar charts (when horizontal). |
| `y-axis-title` | string | `""` | Category axis title for bar charts. |
| `categories` | JSON string | Required for bars | Categories array for the categorical (vertical) axis. For grouped bars provide same-length arrays per series. |
| `gradient` | boolean string | `"false"` | Apply gradient to bars; set `"false"` to disable. For dense bars prefer disabling for speed. |
| `x-axis-offsety` | string | `"2"` | Vertical offset for axis title and rotated label adjustments. |
| `x-axis-label-rotate` | string | `"0"` | Rotation degrees for labels (applies when labels are rendered horizontally). |
| `x-axis-label-rotate-offsety` | string | `"25"` | Vertical offset for rotated labels. |

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bar Chart Example</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="bar"
    title="Revenue Per Month"
    type="bar"
    categories='["Jan", "Feb", "Mar", "Apr", "May"]'
    data='[{"name": "Revenue", "data": [100, 120, 140, 160, 180], "color": "#008FFB"}]'
    x-axis-title="Revenue ($)"
    x-axis-offsety="20"
    y-axis-title="Months"
    height="350px">
  </sithaso-apex>
</body>
</html>
```

### Pie Charts
Pie charts show proportions of a whole using slices, perfect for percentage breakdowns.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `gradient` | boolean string | `"false"` | Apply gradient fills to slices. To customize individual slice colors provide `color` in each data object or use `options.colors`. Accepts either `[[label, value], ...]`, numeric arrays, or series objects. When passing numeric arrays, order maps directly to labels (if `categories` provided) or to the series order. |

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pie Chart Example</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="pie"
    title="Browser Usage Statistics"
    data='[{"name": "Desktop", "data": 44, "color": "#008FFB"}, {"name": "Mobile", "data": 23, "color": "#00E396"}, {"name": "Tablet", "data": 33, "color": "#FEB019"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

### Donut Charts
Donut charts are similar to pie charts but with a hollow center, often used for displaying totals.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `donut-show-total` | boolean string | `"true"` | Show aggregated total in the donut centre. Set to `"false"` to hide. For custom formatting use `options.formatter` inside donut `plotOptions`. |
| `gradient` | boolean string | `"false"` | Apply gradients to donut slices. To fully control appearance use `options.fill` or `options.colors`. |

#### HTML Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donut Chart Example</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="donut"
    title="Browser Market Share"
    data='[{"name": "Chrome", "data": 65, "color": "#008FFB"}, {"name": "Firefox", "data": 20, "color": "#00E396"}, {"name": "Safari", "data": 10, "color": "#FEB019"}, {"name": "Other", "data": 5, "color": "#FF4560"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

### Radial Bar Charts
Radial bar charts display data in circular bars, great for gauges and KPIs.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `hollow-size` | string | `"50%"` | Hollow center size; accepts percentages (`70%`) or pixel values (`100px`). When using `options.plotOptions.radialBar.hollow` provide matching values. |
| `track-width` | string | `"97%"` | Track/stroke width for radial bars. Percent or px accepted. |
| `dashed-radial` | boolean string | `"false"` | When `"true"`, radial bars render with a dashed stroke. Works best for single-series gauge-like charts. |
| `gradient` | boolean string | `"false"` | Enable gradient fill for radial bars; to tune colors use `options.colors`. |

#### HTML Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Radial Bar Example</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="radialBar"
    data='[{"name": "Progress", "data": 70, "color": "#008FFB"}, {"name": "Score", "data": 80, "color": "#00E396"}, {"name": "Rating", "data": 90, "color": "#FEB019"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

### Scatter Charts
Scatter charts plot points on a grid to show relationships between two variables.

#### Properties

| Attribute Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `x-axis-title` | string | `""` | X-axis title text. For numeric scatter data, ensure pairs are `[x,y]` numeric values. |
| `y-axis-title` | string | `""` | Y-axis title text. |
| `marker-size` | string | `"6"` | Marker diameter in pixels. Increase for emphasis or decrease for dense point clouds. |
| `gradient` | boolean string | `"false"` | Gradient does not typically apply to scatter markers; use `options.colors` and `marker` settings for per-point styling. |
| `realtime` | boolean string | `"false"` | Realtime mode supports streaming XY pairs; prefer disabling heavy marker styles when streaming. |
| `x-axis-offsety` | string | `"2"` | Vertical offset for X-axis title and rotated labels. |
| `x-axis-label-rotate` | string | `"0"` | Rotate X-axis labels when numeric labels are long or formatted strings. |
| `x-axis-label-rotate-offsety` | string | `"25"` | Offset for rotated labels.

#### HTML Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scatter Demo (Index)</title>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="SithasoApex.js"></script>
</head>
<body>
  <sithaso-apex
    type="scatter"
    title="Data Correlation Analysis"
    x-axis-title="X Coordinate"
    y-axis-title="Y Coordinate"
    data='[{"name": "Data Points", "data": [[10, 20], [15, 25], [20, 30], [25, 35], [30, 40]], "color": "#008FFB"}]'
    height="300px">
  </sithaso-apex>
</body>
</html>
```

## 📋 Data Formats

### Simple Object Format
```html
<sithaso-apex data='{"January": 100, "February": 120}'></sithaso-apex>
```

### Array Format
```html
<sithaso-apex data='[["January", 100], ["February", 120]]'></sithaso-apex>
```

### Multiple Series
```html
<sithaso-apex data='[
  {"name": "Sales", "data": {"Jan": 100, "Feb": 120}},
  {"name": "Revenue", "data": {"Jan": 80, "Feb": 95}}
]'></sithaso-apex>
```

### Pie Chart Format
```html
<sithaso-apex type="pie" data='[["Apples", 44], ["Bananas", 23]]'></sithaso-apex>
```

## 🎨 Advanced Customization

Use the `options` attribute for full ApexCharts customization:

```html
<sithaso-apex
  type="line"
  data='{"Jan": 100, "Feb": 120, "Mar": 140}'
  options='{
    "colors": ["#FF4560", "#00E396"],
    "stroke": {"width": 3, "curve": "smooth"},
    "fill": {"type": "gradient"},
    "grid": {"show": false},
    "tooltip": {"theme": "dark"}
  }'
  height="400">
</sithaso-apex>
```

## 🔧 JavaScript API

For dynamic interactions, use JavaScript:

```javascript
const chart = document.querySelector('sithaso-apex');

// Update data
chart.data = {"Apr": 160, "May": 180};

// Update options
chart.options = {"title": {"text": "Updated Chart"}};

// Get chart instance
const apexInstance = chart.chart;

// Show loading
chart.loading = true;
```

## 📱 Responsive Design

All charts automatically adapt to different screen sizes with optimized layouts for mobile devices.

## 🛠️ Troubleshooting

- **Charts not displaying**: Ensure ApexCharts script is loaded before the component
- **Invalid data**: Check console for JSON parsing errors
- **Styling issues**: Charts inherit container styles; adjust height/width as needed

## 📄 Examples

Open `index.html` in your browser to see all chart types with various configurations.

## 📄 License

MIT License - Free to use for personal and commercial projects.

---

## 📂 Canonical Examples (from `src/index.html`)

The snippets below are copied verbatim from `src/index.html` so you can copy-paste them exactly as working examples.

```html
<!-- Realtime Line Chart -->
<sithaso-apex
  id="realtime-chart"
  type="line"
  title="Dynamic Updating Chart"
  x-axis-title="Time"
  y-axis-title="Value"
  realtime="true"
  options='{"xaxis": { "type": "datetime", "range": 777600000}}'
  height="350px">
</sithaso-apex>

<!-- Step Line Chart -->
<sithaso-apex
  type="line"
  title="Temperature Changes"
  x-axis-title="Time"
  y-axis-title="Temperature (°C)"
  curve="stepline"
  categories='["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"]'
  data='[{"name": "Temperature", "data": [15, 15, 22, 22, 28, 28, 18], "color": "#00E396"}]'
  height="350px">
</sithaso-apex>

<!-- Dashed Line Chart -->
<sithaso-apex
  type="line"
  title="Project Progress"
  x-axis-title="Weeks"
  y-axis-title="Completion (%)"
  categories='["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"]'
  data='[{"name": "Planned", "data": [10, 25, 40, 60, 75, 90, 100], "color": "#FEB019", "dashed": true}, {"name": "Actual", "data": [30, 67, 70, 90, 100, 160, 150], "color": "#FF4560", "dashed": true}]'
  height="350px">
</sithaso-apex>

<!-- Radial Bar (hollow size + dashed) -->
<sithaso-apex
  type="radialBar"
  data='[{"name": "Cricket", "data": 70, "color": "#008FFB"}]'
  hollow-size="70%"
  dashed-radial="true"
  height="350px">
</sithaso-apex>

<!-- Horizontal Bar Grouped -->
<sithaso-apex
  type="bar"
  title="Monthly Revenue Growth"
  x-axis-title="Revenue vs Target"
  y-axis-title="Month"
  categories='["Jan", "Feb", "Mar", "Apr", "May"]'
  data='[{"name": "Revenue", "data": [100, 120, 140, 160, 180], "color": "#008FFB"}, {"name": "Target", "data": [110, 130, 135, 155, 175], "color": "#00E396"}]'
  height="400px">
</sithaso-apex>

<!-- Dynamic Options Demo (buttons + dynamic chart element) -->
<div>
  <div style="margin-bottom: 15px; color: #666;">Click the buttons below to dynamically update chart options using the setter:</div>
  <div style="margin-bottom: 10px;">
    <button onclick="toggleTheme()">🌓 Toggle Theme</button>
    <button onclick="changeChartColors()">🎨 Colors</button>
    <button onclick="updateChartTitle()">📝 Title</button>
    <button onclick="toggleDataLabels()">🏷️ Labels</button>
    <button onclick="resetChartOptions()">🔄 Reset</button>
  </div>
  <sithaso-apex
    id="dynamic-chart"
    type="bar"
    title="Dynamic Options Demo"
    x-axis-title="Categories"
    y-axis-title="Values"
    data='[{"name": "Series 1", "data": {"A": 10, "B": 20, "C": 30, "D": 40}}]'
    height="350px">
  </sithaso-apex>
</div>
```

---

**Created with ❤️ for easy, beautiful charts**

---

## CI / Puppeteer Test

This repository includes a headless Puppeteer test that validates Example 29 (Stacked Bar Chart) is configured correctly. The test is run in CI via GitHub Actions (`.github/workflows/puppeteer.yml`).

Run it locally:

```powershell
npm install
npm run test:puppeteer
```

Badge (replace `<OWNER>` and `<REPO>` with your GitHub account and repository name):

```markdown
![Puppeteer tests](https://github.com/<OWNER>/<REPO>/actions/workflows/puppeteer.yml/badge.svg)
```

If you prefer CI to use a system-installed Chrome instead of downloading Chromium during `npm install`, set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` in CI and install Chrome in the runner, or modify the workflow to install Chrome before `npm ci`.