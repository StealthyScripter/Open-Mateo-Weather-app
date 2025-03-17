<script setup lang="ts">
import { ref } from 'vue'

const hourlyData = ref([
  { time: 'Now', temp: 9, icon: 'cloudy' },
  { time: '10PM', temp: 9, icon: 'cloudy' },
  { time: '11PM', temp: 10, icon: 'cloudy' },
  { time: '12AM', temp: 9, icon: 'cloudy' },
  { time: '1AM', temp: 10, icon: 'cloudy' },
  { time: '2AM', temp: 10, icon: 'cloudy' },
  { time: '3AM', temp: 10, icon: 'cloudy' },
  { time: '4AM', temp: 10, icon: 'cloudy' }
])

// Function to get the appropriate icon component
const getWeatherIcon = () => {
  // In a real app, you'd return the actual icon component based on the name
  return '☁️'
}
</script>

<template>
  <div class="weather-card hourly-forecast">
    <h2>24h Forecast</h2>

    <div class="forecast-grid">
      <div v-for="(hour, index) in hourlyData" :key="index" class="forecast-item">
        <div class="forecast-time">{{ hour.time }}</div>
        <div class="forecast-icon">
          {{ getWeatherIcon() }}
        </div>
        <div class="forecast-temp">{{ hour.temp }}°C</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hourly-forecast {
  margin-top: var(--spacing-md);
}

.forecast-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
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
</style>
