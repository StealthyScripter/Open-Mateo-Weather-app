<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useWeatherStore } from '@/stores/weather';
import { storeToRefs } from 'pinia';
import { getWeatherAtTime } from '@/utils/mapUtils';

const props = defineProps<{
  etaTime: Date | null;
  routeDuration: number; // in minutes
}>();

const emit = defineEmits<{
  (e: 'update:selectedTime', time: Date): void;
}>();

// Get the weather store
const weatherStore = useWeatherStore();
const { hourlyForecast, temperatureUnit } = storeToRefs(weatherStore);

// Time slider value (0-100%)
const timeSliderValue = ref(100); // Default to ETA (100%)

// Selected time based on slider position
const selectedTime = computed(() => {
  if (!props.etaTime) {
    return new Date();
  }

  const now = new Date();
  const etaMs = props.etaTime.getTime();
  const currentMs = now.getTime();
  const durationMs = etaMs - currentMs;

  // Calculate time based on slider position
  const offsetMs = durationMs * (timeSliderValue.value / 100);
  return new Date(currentMs + offsetMs);
});

// Selected weather based on time
const selectedWeather = computed(() => {
  if (!hourlyForecast.value || hourlyForecast.value.length === 0) {
    return null;
  }

  return getWeatherAtTime(hourlyForecast.value, selectedTime.value);
});

// Format time for display
const formattedTime = computed(() => {
  if (!selectedTime.value) {
    return 'N/A';
  }

  return selectedTime.value.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Watch for changes to the selected time
watch(selectedTime, (newTime) => {
  emit('update:selectedTime', newTime);
});

// Format slider label based on percentage
const getTimeLabel = (percent: number): string => {
  if (!props.etaTime) {
    return 'N/A';
  }

  const now = new Date();
  const etaMs = props.etaTime.getTime();
  const currentMs = now.getTime();
  const durationMs = etaMs - currentMs;

  // Calculate time based on percentage
  const offsetMs = durationMs * (percent / 100);
  const time = new Date(currentMs + offsetMs);

  return time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// When the slider is changed
const onSliderChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  timeSliderValue.value = parseInt(target.value);
};

// Slider ticks for better time selection
const sliderTicks = computed(() => {
  return [0, 25, 50, 75, 100].map(percent => ({
    percent,
    time: getTimeLabel(percent)
  }));
});

// Weather condition at the selected time
const weatherCondition = computed(() => {
  if (!selectedWeather.value) {
    return 'Unknown';
  }

  return selectedWeather.value.condition || 'Unknown';
});

// Temperature at the selected time
const temperature = computed(() => {
  if (!selectedWeather.value) {
    return 0;
  }

  return typeof selectedWeather.value.temp !== 'undefined'
    ? selectedWeather.value.temp
    : 0;
});

// Temperature unit symbol
const tempUnitSymbol = computed(() => {
  return temperatureUnit.value === 'celsius' ? 'C' : 'F';
});

// Weather icon based on condition
const weatherIcon = computed(() => {
  if (!selectedWeather.value) {
    return '☁️';
  }

  const condition = weatherCondition.value.toLowerCase();

  if (condition.includes('clear')) return '☀️';
  if (condition.includes('partly cloudy')) return '⛅';
  if (condition.includes('cloud')) return '☁️';
  if (condition.includes('fog')) return '🌫️';
  if (condition.includes('rain')) return '🌧️';
  if (condition.includes('shower')) return '🌦️';
  if (condition.includes('snow')) return '❄️';
  if (condition.includes('thunder')) return '⛈️';

  return '☁️';
});
</script>

<template>
  <div class="route-weather-container">
    <h3>Weather Along Route</h3>

    <div class="current-weather">
      <div class="weather-icon">{{ weatherIcon }}</div>
      <div class="weather-info">
        <div class="weather-temp">{{ Math.round(temperature) }}°{{ tempUnitSymbol }}</div>
        <div class="weather-condition">{{ weatherCondition }}</div>
        <div class="weather-time">{{ formattedTime }}</div>
      </div>
    </div>

    <div class="time-slider-container">
      <div class="time-slider-value">
        Weather at: {{ formattedTime }}
      </div>

      <input
        type="range"
        class="time-slider"
        min="0"
        max="100"
        step="1"
        v-model="timeSliderValue"
        @input="onSliderChange"
      />

      <div class="time-slider-labels">
        <span v-for="tick in sliderTicks" :key="tick.percent">
          {{ tick.time }}
        </span>
      </div>

      <div class="time-slider-ticks">
        <span class="time-slider-tick" v-for="tick in sliderTicks" :key="tick.percent">
          |
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-weather-container {
  background-color: var(--color-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow);
}

h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: 1.2rem;
}

.current-weather {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.weather-icon {
  font-size: 3rem;
}

.weather-temp {
  font-size: 1.5rem;
  font-weight: bold;
}

.weather-condition {
  margin-top: 2px;
}

.weather-time {
  color: var(--color-text-light);
  font-size: 0.9rem;
  margin-top: 2px;
}

.time-slider-container {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.time-slider {
  width: 100%;
  margin: var(--spacing-sm) 0;
}

.time-slider-value {
  text-align: center;
  font-weight: bold;
  margin-bottom: var(--spacing-sm);
}

.time-slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-light);
}

.time-slider-ticks {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-light);
  margin-top: -5px;
}

.time-slider-tick {
  font-size: 0.8rem;
}
</style>
