const mongoose = require('mongoose');

const WidgetSchema = new mongoose.Schema({
  type: String,
  enabled: Boolean,
  position: Number
});

const CustomChartSchema = new mongoose.Schema({
  id: String,
  chartType: String,
  source: String,
  field: String,
  timeConfig: String
});

const DashboardConfigSchema = new mongoose.Schema({
  id: Number,
  role: {
    type: String,
    required: true
  },
  widgets: [WidgetSchema],
  customCharts: [CustomChartSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('DashboardConfig', DashboardConfigSchema);
