<script setup lang="ts">
import { formatTemperature } from '@/utils/temperatureConverter';

defineProps<{
  hourlyData: Array<{
    time: string;
    temp: number;
    icon: string;
  }>,
  unit: string
}>()

// Function to get the appropriate icon component
const getWeatherIcon = (icon: string) => {
  const iconMap: Record<string, string> = {
    'clear': '☀️',
    'cloudy': '☁️',
    'partly-cloudy': '⛅',
    'fog': '🌫️',
    'rain': '🌧️',
    'showers': '🌦️',
    'snow': '❄️',
    'thunderstorm': '⛈️'
  };

  return iconMap[icon] || '☁️';
}
</script>

<template>
  <div class="weather-card hourly-forecast">
    <h2>24h Forecast</h2>

    <div class="forecast-grid">
      <div v-for="(hour, index) in hourlyData" :key="index" class="forecast-item">
        <div class="forecast-time">{{ hour.time }}</div>
        <div class="forecast-icon">
          {{ getWeatherIcon(hour.icon) }}
        </div>
        <div class="forecast-temp">{{ formatTemperature(hour.temp, unit) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
