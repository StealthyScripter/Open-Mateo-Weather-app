<script setup lang="ts">
defineProps<{
  weather: {
    temperature: number;
    condition: string;
    feelsLike: number;
    high: number;
    low: number;
  }
}>()
</script>

<template>
  <div class="weather-card current-weather">
    <div class="weather-main">
      <div class="weather-icon-container">
        <div class="weather-icon">
          <!-- Replace with actual weather icon component -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
      </div>
      <div class="weather-data">
        <div class="temperature">
          <span class="current-temp">{{ weather.temperature }}°C</span>
          <div class="temperature-range">
            <span class="high-temp">↑ {{ weather.high }}°</span>
            <span class="low-temp">↓ {{ weather.low }}°</span>
          </div>
        </div>
        <div class="condition">
          <p>{{ weather.condition }}</p>
          <p class="feels-like">Feels like {{ weather.feelsLike }}°C</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.current-weather {
  display: flex;
  flex-direction: column;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.weather-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.weather-data {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.temperature {
  display: flex;
  flex-direction: column;
}

.current-temp {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.temperature-range {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.high-temp {
  color: #e53e3e;
}

.low-temp {
  color: #3182ce;
}

.condition {
  display: flex;
  flex-direction: column;
  font-size: 1.1rem;
}

.condition p {
  margin: 0;
}

.feels-like {
  font-size: 0.9rem;
  color: var(--color-text-light);
}

@media (max-width: 768px) {
  .weather-main {
    flex-direction: column;
    text-align: center;
  }

  .weather-data {
    flex-direction: column;
    width: 100%;
  }
}
</style>
