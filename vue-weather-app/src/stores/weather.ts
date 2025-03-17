import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getWeatherByCity, getWeatherCodeDescription } from '../services/weatherApi'

// Define interfaces for better type safety
interface CurrentWeather {
  temperature: number;
  condition: string;
  feelsLike: number;
  windspeed: number;
  winddirection: number;
  pressure: number;
  relativeHumidity: number;
  uvIndex: number;
}

interface HourlyForecast {
  time: string;
  temp: number;
  icon: number;
  condition: string;
}

interface DailyForecast {
  day: string;
  high: number;
  low: number;
  icon: number;
  condition: string;
}

interface WeatherDetails {
  wind: {
    speed: number;
    direction: string;
  };
  humidity: number;
  uvIndex: number;
  pressure: number;
}

// Helper function to safely convert to number
function toNumber(value: string | number | undefined): number {
  if (value === undefined) return 0;
  return typeof value === 'string' ? parseFloat(value) : value;
}

export const useWeatherStore = defineStore('weather', () => {
  const currentWeather = ref<CurrentWeather | null>(null)
  const hourlyForecast = ref<HourlyForecast[]>([])
  const dailyForecast = ref<DailyForecast[]>([])
  const locationName = ref('Raleigh, NC, USA')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const temperatureUnit = ref<'celsius' | 'fahrenheit'>('celsius')

  const formattedDate = computed(() => {
    const now = new Date()
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })

  const formattedTime = computed(() => {
    return lastUpdated.value ? lastUpdated.value.toLocaleTimeString('en-US') : ''
  })

  const weatherDetails = computed<WeatherDetails | null>(() => {
    if (!currentWeather.value) return null

    return {
      wind: {
        speed: currentWeather.value.windspeed,
        direction: getWindDirection(currentWeather.value.winddirection)
      },
      humidity: currentWeather.value.relativeHumidity,
      uvIndex: currentWeather.value.uvIndex,
      pressure: currentWeather.value.pressure
    }
  })

  const highTemperature = computed(() => {
    if (!dailyForecast.value.length) return null
    return dailyForecast.value[0].high
  })

  const lowTemperature = computed(() => {
    if (!dailyForecast.value.length) return null
    return dailyForecast.value[0].low
  })

  // Helper functions
  function getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  async function fetchWeatherData(city: string) {
    isLoading.value = true
    error.value = null

    try {
      const data = await getWeatherByCity(city)

      // Process current weather
      if (data.current) {
        currentWeather.value = {
          temperature: toNumber(data.current.temperature),
          condition: getWeatherCodeDescription(toNumber(data.current.weathercode)),
          feelsLike: toNumber(data.current.apparent_temperature || data.current.temperature),
          windspeed: toNumber(data.current.wind_speed_10m),
          winddirection: toNumber(data.current.wind_direction_10m),
          pressure: toNumber(data.current.pressure_msl),
          relativeHumidity: toNumber(data.current.relative_humidity_2m),
          uvIndex: toNumber(data.current.uv_index || 0)
        }
      }

      // Process hourly forecast
      if (data.hourly && data.hourly.time && data.hourly.temperature_2m && data.hourly.weather_code) {
        const times = data.hourly.time as string[];
        const temps = data.hourly.temperature_2m;
        const codes = data.hourly.weather_code;

        const hourlyData = times.map((time, index) => ({
          time: new Date(time).toLocaleTimeString('en-US', { hour: 'numeric' }),
          temp: toNumber(temps[index]),
          icon: toNumber(codes[index]),
          condition: getWeatherCodeDescription(toNumber(codes[index]))
        })).slice(0, 24); // Next 24 hours

        hourlyForecast.value = hourlyData;
      }

      // Process daily forecast
      if (data.daily && data.daily.time && data.daily.temperature_2m_max &&
          data.daily.temperature_2m_min && data.daily.weather_code) {
        const dates = data.daily.time as string[];
        const maxTemps = data.daily.temperature_2m_max;
        const minTemps = data.daily.temperature_2m_min;
        const codes = data.daily.weather_code;

        const dailyData = dates.map((date, index) => {
          const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
          return {
            day,
            high: toNumber(maxTemps[index]),
            low: toNumber(minTemps[index]),
            icon: toNumber(codes[index]),
            condition: getWeatherCodeDescription(toNumber(codes[index]))
          };
        });

        dailyForecast.value = dailyData;
      }

      locationName.value = city
      lastUpdated.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch weather data'
    } finally {
      isLoading.value = false
    }
  }

  function setTemperatureUnit(unit: 'celsius' | 'fahrenheit') {
    temperatureUnit.value = unit
  }

  // Initialize with default location
  fetchWeatherData(locationName.value)

  return {
    currentWeather,
    hourlyForecast,
    dailyForecast,
    locationName,
    isLoading,
    error,
    lastUpdated,
    formattedDate,
    formattedTime,
    weatherDetails,
    highTemperature,
    lowTemperature,
    temperatureUnit,
    fetchWeatherData,
    setTemperatureUnit
  }
})
