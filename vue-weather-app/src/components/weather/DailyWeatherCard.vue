<template>
  <div class="weather-card">
    <h2 class="weather-title">7-Day Weather Forecast</h2>

    <div class="location-search">
      <input
        v-model="city"
        @keyup.enter="fetchWeatherForCity"
        placeholder="Enter city name"
        class="city-input"
      />
      <button @click="fetchWeatherForCity" class="search-btn">Search</button>
    </div>

    <div class="temp-unit-toggle">
      <label class="unit-label">
        <input
          type="radio"
          name="tempUnit"
          value="celsius"
          v-model="temperatureUnit"
          @change="updateTemperatureUnit"
        /> °C
      </label>
      <label class="unit-label">
        <input
          type="radio"
          name="tempUnit"
          value="fahrenheit"
          v-model="temperatureUnit"
          @change="updateTemperatureUnit"
        /> °F
      </label>
    </div>

    <div v-if="loading" class="loading">Loading weather data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="forecast-container">
      <div v-for="(day, index) in processedForecast" :key="index" class="day-card">
        <div class="day-name">{{ formatDate(day.date) }}</div>
        <div class="weather-icon">
          <img :src="getWeatherIcon(day.weatherCode)" :alt="day.description" />
        </div>
        <div class="temperature">
          <span class="temp-max">{{ Math.round(day.tempMax) }}°</span>
          <span class="temp-min">{{ Math.round(day.tempMin) }}°</span>
        </div>
        <div class="weather-description">{{ day.description }}</div>
        <div class="precipitation" v-if="day.precipitationSum > 0">
          <span>{{ day.precipitationSum }}mm</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import weatherService, { celsiusToFahrenheit } from '../../services/weatherApi';

// Define the WeatherApiResponse interface locally since it's not exported
interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units?: {
    [key: string]: string;
  };
  current?: {
    temperature: number;
    weathercode: number;
    windspeed: number;
    winddirection: number;
    time: string;
    [key: string]: number | string;
  };
  hourly_units?: {
    [key: string]: string;
  };
  hourly?: {
    [key: string]: string[] | number[] | undefined;
  };
  daily_units?: {
    [key: string]: string;
  };
  daily?: {
    [key: string]: string[] | number[] | undefined;
  };
}

interface DayForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  description: string;
}

export default defineComponent({
  name: 'WeatherForecast',

  setup() {
    const weatherData = ref<WeatherApiResponse | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const city = ref('Raleigh');
    const temperatureUnit = ref<'celsius' | 'fahrenheit'>('fahrenheit');

    const processedForecast = computed((): DayForecast[] => {
      if (!weatherData.value || !weatherData.value.daily) {
        return [];
      }

      const { daily } = weatherData.value;
      const time = daily.time as string[];
      const weathercode = daily.weather_code as number[];
      const tempMax = daily.temperature_2m_max as number[];
      const tempMin = daily.temperature_2m_min as number[];
      const precipSum = daily.precipitation_sum as number[];

      return time.map((date, index) => {
        let maxTemp = tempMax[index];
        let minTemp = tempMin[index];

        // Convert temperatures if unit is fahrenheit
        if (temperatureUnit.value === 'fahrenheit') {
          maxTemp = celsiusToFahrenheit(maxTemp);
          minTemp = celsiusToFahrenheit(minTemp);
        }

        return {
          date,
          weatherCode: weathercode[index],
          tempMax: maxTemp,
          tempMin: minTemp,
          precipitationSum: precipSum[index],
          description: weatherService.getWeatherCodeDescription(weathercode[index])
        };
      });
    });

    const fetchWeatherForCity = async () => {
      try {
        loading.value = true;
        error.value = null;
        weatherData.value = await weatherService.getWeatherByCity(city.value);
        loading.value = false;
      } catch (err) {
        error.value = `Error fetching weather data: ${err.message}`;
        loading.value = false;
      }
    };

    const updateTemperatureUnit = () => {
      // No need to refetch, we'll convert in the computed property
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getWeatherIcon = (code: number) => {
      // Weather code to icon mapping
      const iconMap: Record<number, string> = {
        0: 'https://cdn.weatherapi.com/weather/64x64/day/113.png', // Clear sky
        1: 'https://cdn.weatherapi.com/weather/64x64/day/116.png', // Mainly clear
        2: 'https://cdn.weatherapi.com/weather/64x64/day/119.png', // Partly cloudy
        3: 'https://cdn.weatherapi.com/weather/64x64/day/122.png', // Overcast
        45: 'https://cdn.weatherapi.com/weather/64x64/day/143.png', // Fog
        48: 'https://cdn.weatherapi.com/weather/64x64/day/248.png', // Depositing rime fog
        51: 'https://cdn.weatherapi.com/weather/64x64/day/176.png', // Light drizzle
        53: 'https://cdn.weatherapi.com/weather/64x64/day/176.png', // Moderate drizzle
        55: 'https://cdn.weatherapi.com/weather/64x64/day/176.png', // Dense drizzle
        61: 'https://cdn.weatherapi.com/weather/64x64/day/176.png', // Slight rain
        63: 'https://cdn.weatherapi.com/weather/64x64/day/176.png', // Moderate rain
        65: 'https://cdn.weatherapi.com/weather/64x64/day/176.png', // Heavy rain
        71: 'https://cdn.weatherapi.com/weather/64x64/day/179.png', // Slight snow
        73: 'https://cdn.weatherapi.com/weather/64x64/day/179.png', // Moderate snow
        75: 'https://cdn.weatherapi.com/weather/64x64/day/179.png', // Heavy snow
        80: 'https://cdn.weatherapi.com/weather/64x64/day/302.png', // Slight rain showers
        81: 'https://cdn.weatherapi.com/weather/64x64/day/302.png', // Moderate rain showers
        82: 'https://cdn.weatherapi.com/weather/64x64/day/302.png', // Violent rain showers
        95: 'https://cdn.weatherapi.com/weather/64x64/day/200.png', // Thunderstorm
        96: 'https://cdn.weatherapi.com/weather/64x64/day/386.png', // Thunderstorm with slight hail
        99: 'https://cdn.weatherapi.com/weather/64x64/day/389.png', // Thunderstorm with heavy hail
      };

      return iconMap[code] || 'https://cdn.weatherapi.com/weather/64x64/day/113.png';
    };

    // Fetch data on component creation
    fetchWeatherForCity();

    return {
      weatherData,
      loading,
      error,
      city,
      temperatureUnit,
      processedForecast,
      fetchWeatherForCity,
      formatDate,
      getWeatherIcon,
      updateTemperatureUnit
    };
  }
});
</script>

<style scoped>
.weather-card {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.weather-title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.location-search {
  display: flex;
  margin-bottom: 20px;
  justify-content: center;
}

.city-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  width: 60%;
  font-size: 16px;
}

.search-btn {
  padding: 8px 16px;
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 16px;
}

.search-btn:hover {
  background-color: #3a5a80;
}

.temp-unit-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 20px;
}

.unit-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.forecast-container {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 10px;
}

.day-card {
  min-width: 120px;
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.day-name {
  font-weight: bold;
  margin-bottom: 8px;
}

.weather-icon {
  width: 64px;
  height: 64px;
  margin: 10px 0;
}

.weather-icon img {
  width: 100%;
  height: 100%;
}

.temperature {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.temp-max {
  font-weight: bold;
  color: #e03e3e;
}

.temp-min {
  color: #3e7be0;
}

.weather-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.precipitation {
  font-size: 14px;
  color: #3e7be0;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #e03e3e;
}
</style>
