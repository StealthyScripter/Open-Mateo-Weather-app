<template>
  <div class="temperature-chart">
    <h3>{{ title }}</h3>
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import Chart from 'chart.js/auto';
import type { ChartData, ChartOptions, ChartTypeRegistry } from 'chart.js';

export default defineComponent({
  name: 'TemperatureChart',
  props: {
    tempData: {
      type: Array as PropType<number[]>,
      required: true
    },
    timeLabels: {
      type: Array as PropType<string[]>,
      required: true
    },
    minTemp: {
      type: Array as PropType<number[]>,
      default: () => []
    },
    maxTemp: {
      type: Array as PropType<number[]>,
      default: () => []
    },
    title: {
      type: String,
      default: 'Temperature'
    },
    timeUnit: {
      type: String,
      default: 'hourly',
      validator: (value: string) => ['hourly', 'daily', 'weekly'].includes(value)
    },
    chartType: {
      type: String,
      default: 'line',
      validator: (value: string) => ['bar', 'line'].includes(value)
    },
    temperatureUnit: {
      type: String,
      default: '°C',
      validator: (value: string) => ['°C', '°F'].includes(value)
    }
  },
  data() {
    return {
      chart: null as Chart<keyof ChartTypeRegistry, number[], string> | null
    };
  },
  computed: {
    showMinMaxTemp(): boolean {
      return this.minTemp.length > 0 && this.maxTemp.length > 0;
    }
  },
  watch: {
    tempData: {
      handler() {
        this.updateChart();
      },
      deep: true
    },
    minTemp: {
      handler() {
        this.updateChart();
      },
      deep: true
    },
    maxTemp: {
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
      const chartCanvas = this.$refs.chartCanvas as HTMLCanvasElement;
      const ctx = chartCanvas.getContext('2d');

      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }

      const datasets = [
        {
          label: `Temperature (${this.temperatureUnit})`,
          data: this.tempData,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          tension: 0.4
        }
      ];

      if (this.showMinMaxTemp) {
        datasets.push({
          label: `Min Temperature (${this.temperatureUnit})`,
          data: this.minTemp,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          tension: 0.4
        });

        datasets.push({
          label: `Max Temperature (${this.temperatureUnit})`,
          data: this.maxTemp,
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          tension: 0.4
        });
      }

      const chartData: ChartData<'line' | 'bar', number[], string> = {
        labels: this.timeLabels,
        datasets: datasets
      };

      const chartOptions: ChartOptions<'line' | 'bar'> = {
        responsive: true,
        scales: {
          y: {
            title: {
              display: true,
              text: `Temperature (${this.temperatureUnit})`
            }
          },
          x: {
            title: {
              display: true,
              text: this.getXAxisTitle()
            }
          }
        }
      };

      this.chart = new Chart(ctx, {
        type: this.chartType as 'line' | 'bar',
        data: chartData,
        options: chartOptions
      });
    },
    updateChart() {
      if (!this.chart) return;

      this.chart.data.labels = this.timeLabels;
      this.chart.data.datasets[0].data = this.tempData;
      this.chart.data.datasets[0].label = `Temperature (${this.temperatureUnit})`;

      if (this.showMinMaxTemp) {
        if (this.chart.data.datasets.length < 3) {
          this.chart.destroy();
          this.createChart();
        } else {
          this.chart.data.datasets[1].data = this.minTemp;
          this.chart.data.datasets[1].label = `Min Temperature (${this.temperatureUnit})`;
          this.chart.data.datasets[2].data = this.maxTemp;
          this.chart.data.datasets[2].label = `Max Temperature (${this.temperatureUnit})`;
        }
      } else if (this.chart.data.datasets.length > 1) {
        this.chart.destroy();
        this.createChart();
      }

      if (this.chart.options && this.chart.options.scales) {
        const scales = this.chart.options.scales as {
          y: { title: { text: string } },
          x: { title: { text: string } }
        };

        if (scales.y && scales.y.title) {
          scales.y.title.text = `Temperature (${this.temperatureUnit})`;
        }

        if (scales.x && scales.x.title) {
          scales.x.title.text = this.getXAxisTitle();
        }
      }

      if (this.chart.config && this.chart.config.type) {
        (this.chart.config).type = this.chartType;
      }

      this.chart.update();
    },
    getXAxisTitle(): string {
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
});
</script>

<style scoped>
.temperature-chart {
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
