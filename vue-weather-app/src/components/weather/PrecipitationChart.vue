<template>
  <div class="precipitation-chart">
    <h3>{{ title }}</h3>
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import Chart from 'chart.js/auto';

export default {
  name: 'PrecipitationChart',
  props: {
    chartData: {
      type: Array,
      required: true
    },
    timeLabels: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: 'Precipitation'
    },
    timeUnit: {
      type: String,
      default: 'hourly',
      validator: value => ['hourly', 'daily', 'weekly'].includes(value)
    },
    chartType: {
      type: String,
      default: 'bar',
      validator: value => ['bar', 'line'].includes(value)
    }
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    chartData: {
      handler() {
        this.updateChart();
      },
      deep: true
    },
    timeUnit() {
      this.updateChart();
    },
    chartType() {
      this.updateChart();
    }
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d');

      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: {
          labels: this.timeLabels,
          datasets: [{
            label: 'Precipitation (mm)',
            data: this.chartData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Precipitation (mm)'
              }
            },
            x: {
              title: {
                display: true,
                text: this.getXAxisTitle()
              }
            }
          }
        }
      });
    },
    updateChart() {
      if (this.chart) {
        this.chart.data.labels = this.timeLabels;
        this.chart.data.datasets[0].data = this.chartData;
        this.chart.options.scales.x.title.text = this.getXAxisTitle();
        this.chart.config.type = this.chartType;
        this.chart.update();
      }
    },
    getXAxisTitle() {
      switch(this.timeUnit) {
        case 'hourly':
          return 'Hours';
        case 'daily':
          return 'Days';
        case 'weekly':
          return 'Weeks';
        default:
          return 'Time';
      }
    }
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
</script>

<style scoped>
.precipitation-chart {
  width: 100%;
  margin-bottom: 20px;
}

.chart-container {
  position: relative;
  height: 300px;
}

h3 {
  text-align: center;
  margin-bottom: 10px;
}
</style>
