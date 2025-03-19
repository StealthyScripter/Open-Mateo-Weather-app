<script setup lang="ts">
import PageInfo from '@/components/layout/PageInfo.vue'
import HourlyForecast from '@/components/weather/HourlyForecast.vue'
import TemperatureChart from '../components/weather/TemperatureChart.vue'
import PrecipitationChart from '../components/weather/PrecipitationChart.vue'
import { ref, computed } from 'vue'

const selectedTab = ref('hourly');
const unit = ref('C');

// Mock data for hourly forecast
const currentWeather = ref({
  location: 'Raleigh, NC, USA',
  date: 'Saturday, March 15, 2025',
  lastUpdated: '9:54:11 PM',
  temperature: 17,
  condition: 'Clear Sky',
  feelsLike: 15,
  high: 22,
  low: 9
})

// Mock hourly forecast data
const hourlyData = ref([
  { time: '12 AM', temp: 18, icon: 'clear' },
  { time: '1 AM', temp: 17, icon: 'clear' },
  { time: '2 AM', temp: 16, icon: 'clear' },
  { time: '3 AM', temp: 15, icon: 'partly-cloudy' },
  { time: '4 AM', temp: 14, icon: 'partly-cloudy' },
  { time: '5 AM', temp: 14, icon: 'cloudy' },
  { time: '6 AM', temp: 15, icon: 'cloudy' },
  { time: '7 AM', temp: 16, icon: 'partly-cloudy' },
  { time: '8 AM', temp: 18, icon: 'partly-cloudy' },
  { time: '9 AM', temp: 20, icon: 'clear' },
  { time: '10 AM', temp: 22, icon: 'clear' },
  { time: '11 AM', temp: 23, icon: 'clear' },
  { time: '12 PM', temp: 25, icon: 'clear' },
  { time: '1 PM', temp: 26, icon: 'partly-cloudy' },
  { time: '2 PM', temp: 27, icon: 'partly-cloudy' },
  { time: '3 PM', temp: 26, icon: 'partly-cloudy' },
  { time: '4 PM', temp: 25, icon: 'cloudy' },
  { time: '5 PM', temp: 24, icon: 'rain' },
  { time: '6 PM', temp: 22, icon: 'rain' },
  { time: '7 PM', temp: 21, icon: 'showers' },
  { time: '8 PM', temp: 20, icon: 'partly-cloudy' },
  { time: '9 PM', temp: 19, icon: 'clear' },
  { time: '10 PM', temp: 18, icon: 'clear' },
  { time: '11 PM', temp: 17, icon: 'clear' }
])

// Extract data for charts
const tempData = computed(() => hourlyData.value.map(hour => hour.temp));
const timeLabels = computed(() => hourlyData.value.map(hour => hour.time));

// Mock precipitation data
const precipData = ref([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 2.5, 3.8, 1.2, 0, 0, 0, 0
]);
</script>

<template>
  <div class="hourly-view">
    <PageInfo
      :location="currentWeather.location"
      :date="currentWeather.date"
      :lastUpdated="currentWeather.lastUpdated"
      :selectedTab="selectedTab"
      :unit="unit"
      @update:selectedTab="selectedTab = $event"
      @update:unit="unit = $event"
    />

    <HourlyForecast :hourlyData="hourlyData" :unit="unit" />

    <TemperatureChart
      :tempData="tempData"
      :timeLabels="timeLabels"
      :temperatureUnit="unit === 'C' ? '°C' : '°F'"
      title="Hourly Temperature Forecast"
    />

    <PrecipitationChart
      :chartData="precipData"
      :timeLabels="timeLabels"
      timeUnit="hourly"
      title="Hourly Precipitation Forecast"
    />
  </div>
</template>

<style scoped>
.hourly-view {
  padding: var(--spacing-md) 0;
}

.weather-card {
  background-color: var(--color-card);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.hourly-forecast {
  margin-top: var(--spacing-md);
}

.forecast-grid {
  display: flex;
  overflow-x: auto;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
}

.forecast-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  min-width: 80px;
  background-color: var(--color-background-light);
  transition: transform 0.2s ease;
}

.forecast-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.forecast-time {
  font-size: 0.9rem;
  color: var(--color-text-light);
}

.forecast-icon {
  font-size: 1.5rem;
  margin: var(--spacing-sm) 0;
}

.forecast-temp {
  font-weight: 600;
}

@media (max-width: 600px) {
  .forecast-item {
    min-width: 70px;
  }
}
</style>
