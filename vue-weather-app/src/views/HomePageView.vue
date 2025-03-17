<script setup lang="ts">
import CurrentWeather from '../components/weather/CurrentWeather.vue'
import HourlyForecast from '../components/weather/HourlyForecast.vue'
import DailyForecast from '../components/weather/DailyForecast.vue'
import WeatherDetails from '../components/weather/WeatherDetails.vue'
import { ref } from 'vue'

const selectedTab = ref('current')

// Mock data for our weather components
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

const weatherDetails = ref({
  wind: { speed: 17, direction: 'SE' },
  humidity: 85,
  uvIndex: 0,
  pressure: 1002
})

// Additional data would be defined here for hourly and daily forecasts
</script>

<template>
  <div class="home-view">
    <div class="location-info">
      <h1>{{ currentWeather.location }} <span class="favorite-icon">☆</span></h1>
      <p class="date-info">{{ currentWeather.date }} | Last updated: {{ currentWeather.lastUpdated }}</p>
    </div>

    <div class="weather-tabs">
      <button
        class="tab"
        :class="{ active: selectedTab === 'current' }"
        @click="selectedTab = 'current'"
      >
        Current
      </button>
      <button
        class="tab"
        :class="{ active: selectedTab === 'hourly' }"
        @click="selectedTab = 'hourly'"
      >
        24 Hour
      </button>
      <button
        class="tab"
        :class="{ active: selectedTab === 'daily' }"
        @click="selectedTab = 'daily'"
      >
        7 Day
      </button>
      <div class="temperature-units">
        <button class="unit-button active">°C</button>
        <button class="unit-button">°F</button>
      </div>
    </div>

    <!-- Render the appropriate component based on the selected tab -->
    <CurrentWeather v-if="selectedTab === 'current'" :weather="currentWeather" />
    <WeatherDetails v-if="selectedTab === 'current'" :details="weatherDetails" />
    <HourlyForecast v-if="selectedTab === 'hourly'" />
    <DailyForecast v-if="selectedTab === 'daily'" />
  </div>
</template>

<style scoped>
.home-view {
  padding: var(--spacing-md) 0;
}

.location-info {
  margin-bottom: var(--spacing-lg);
}

.location-info h1 {
  font-size: 1.8rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.favorite-icon {
  color: #ccc;
  cursor: pointer;
  font-size: 1.5rem;
}

.date-info {
  color: var(--color-text-light);
  margin: var(--spacing-sm) 0 0;
  font-size: 0.9rem;
}

.weather-tabs {
  display: flex;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  position: relative;
  padding-bottom: var(--spacing-sm);
}

.weather-section {
  margin-bottom:var(--spacing-lg);
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.weather-section-enter-active, .weather-section-leave-active {
  opacity: 1;
}

.tab {
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-text-light);
}

.tab.active {
  color: var(--color-primary);
  font-weight: 600;
  border-bottom: 2px solid var(--color-primary);
}

.temperature-units {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.unit-button {
  padding: var(--spacing-sm);
  background: none;
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-size: 0.9rem;
}

.unit-button:first-child {
  border-top-left-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
}

.unit-button:last-child {
  border-top-right-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}

.unit-button.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
</style>
