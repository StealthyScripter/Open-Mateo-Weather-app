<script setup lang="ts">
defineProps<{
  details: {
    wind: {
      speed: number;
      direction: string;
    };
    humidity: number;
    uvIndex: number;
    pressure: number;
  }
}>()
</script>

<template>
  <div class="weather-card weather-details">
    <div class="details-grid">
      <div class="detail-item">
        <div class="detail-icon">
          <!-- Wind icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" stroke="currentColor" stroke-width="2" d="M9.59,4.59A2,2,0,1,1,11,8H2m10.59,11.41A2,2,0,1,0,14,16H2m15.73-8.27A2.5,2.5,0,1,1,19.5,12H2" />
          </svg>
        </div>
        <div class="detail-data">
          <div class="detail-value">{{ details.wind.speed }} km/h</div>
          <div class="detail-label">{{ details.wind.direction }}</div>
        </div>
      </div>

      <div class="detail-item">
        <div class="detail-icon">
          <!-- Humidity icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" stroke="currentColor" stroke-width="2" d="M12,2.69l5.66,5.66a8,8,0,1,1-11.31,0Z" />
          </svg>
        </div>
        <div class="detail-data">
          <div class="detail-value">{{ details.humidity }}%</div>
          <div class="detail-label">Humidity</div>
        </div>
      </div>

      <div class="detail-item">
        <div class="detail-icon">
          <!-- UV index icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2" />
            <path fill="none" stroke="currentColor" stroke-width="2" d="M12,2V4M12,20v2M4.93,4.93l1.41,1.41M17.66,17.66l1.41,1.41M2,12H4M20,12h2M4.93,19.07l1.41-1.41M17.66,6.34l1.41-1.41" />
          </svg>
        </div>
        <div class="detail-data">
          <div class="detail-value">{{ details.uvIndex }}</div>
          <div class="detail-label">UV Index</div>
        </div>
      </div>

      <div class="detail-item">
        <div class="detail-icon">
          <!-- Pressure icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
            <path fill="none" stroke="currentColor" stroke-width="2" d="M12,12 L12,6 M12,12 L7,12" />
          </svg>
        </div>
        <div class="detail-data">
          <div class="detail-value">{{ details.pressure }}</div>
          <div class="detail-label">Pressure</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-details {
  margin-top: var(--spacing-md);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-md);
}

.detail-icon {
  margin-bottom: var(--spacing-sm);
  color: var(--color-secondary);
}

.detail-value {
  font-size: 1.3rem;
  font-weight: 600;
}

.detail-label {
  font-size: 0.9rem;
  color: var(--color-text-light);
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
