<script setup lang="ts">
import PageInfo from '@/components/layout/PageInfo.vue'
import WeatherForecast from '../components/weather/DailyWeatherCard.vue'
import { ref, watch } from 'vue'

const selectedTab = ref('daily');
const unit = ref('C');

// Mock data for current weather
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

// Handle unit changes and pass to WeatherForecast component
const temperatureUnit = ref<'celsius' | 'fahrenheit'>('celsius');

// Watch for unit changes from PageInfo component
watch(unit, (newUnit) => {
  temperatureUnit.value = newUnit === 'C' ? 'celsius' : 'fahrenheit';
});

// Default city
const city = ref('Raleigh');
</script>

<template>
  <div class="daily-view">
    <PageInfo
      :location="currentWeather.location"
      :date="currentWeather.date"
      :lastUpdated="currentWeather.lastUpdated"
      :selectedTab="selectedTab"
      :unit="unit"
      @update:selectedTab="selectedTab = $event"
      @update:unit="unit = $event"
    />

    <WeatherForecast
      v-model:city="city"
      v-model:temperatureUnit="temperatureUnit"
    />
  </div>
</template>

<style scoped>
.daily-view {
  padding: var(--spacing-md) 0;
}

/* Additional styles for the daily view */
:deep(.weather-card) {
  font-family: inherit;
  background-color: var(--color-card);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

:deep(.weather-title) {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

:deep(.search-btn) {
  background-color: var(--color-primary);
}

:deep(.search-btn:hover) {
  background-color: var(--color-primary-dark);
}

:deep(.day-card) {
  background-color: var(--color-background-light);
  border-radius: var(--border-radius);
  transition: transform 0.2s ease;
}

:deep(.day-card:hover) {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Make the forecast scrollable on mobile */
@media (max-width: 600px) {
  :deep(.forecast-container) {
    padding-bottom: var(--spacing-sm);
  }

  :deep(.day-card) {
    min-width: 100px;
  }
}
</style>
