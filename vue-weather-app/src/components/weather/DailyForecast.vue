<script setup lang="ts">
import { ref } from 'vue'

const dailyData = ref([
  { day: 'Sat', high: 22, low: 9, icon: 'rainy' },
  { day: 'Sun', high: 21, low: 17, icon: 'heavy-rain' },
  { day: 'Mon', high: 16, low: 9, icon: 'cloudy' },
  { day: 'Tue', high: 19, low: 6, icon: 'sunny' },
  { day: 'Wed', high: 22, low: 9, icon: 'cloudy' },
  { day: 'Thu', high: 15, low: 9, icon: 'cloudy' },
  { day: 'Fri', high: 16, low: 5, icon: 'cloudy' }
])

// Function to get the appropriate icon component
const getWeatherIcon = (iconName: string) => {
  // In a real app, you'd return the actual icon component based on the name
  switch (iconName) {
    case 'rainy': return '🌧️'
    case 'heavy-rain': return '⛈️'
    case 'cloudy': return '☁️'
    case 'sunny': return '☀️'
    default: return '☁️'
  }
}
</script>

<template>
  <div class="weather-card daily-forecast">
    <h2>
      7-Day Forecast
      <a href="#" class="view-calendar">View Calendar</a>
    </h2>

    <div class="forecast-grid">
      <div v-for="(day, index) in dailyData" :key="index" class="forecast-item">
        <div class="forecast-day">{{ day.day }}</div>
        <div class="forecast-icon">
          {{ getWeatherIcon(day.icon) }}
        </div>
        <div class="forecast-temp-range">
          <span class="high-temp">{{ day.high }}°</span>
          <span class="low-temp">{{ day.low }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.daily-forecast {
  margin-top: var(--spacing-md);
}

.view-calendar {
  font-size: 0.9rem;
  color: var(--color-secondary);
  text-decoration: none;
}

.forecast-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-sm);
  border-radius: var(--border-radius);
}

.forecast-day {
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.forecast-icon {
  font-size: 1.8rem;
  margin: var(--spacing-sm) 0;
}

.forecast-temp-range {
  display: flex;
  gap: var(--spacing-sm);
  font-size: 0.9rem;
}

.high-temp {
  color: #e53e3e;
  font-weight: 600;
}

.low-temp {
  color: #3182ce;
}
</style>
