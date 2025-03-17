import axios from 'axios'

const API_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export interface WeatherApiParams {
  latitude: number;
  longitude: number;
  current?: string[];
  hourly?: string[];
  daily?: string[];
  timezone?: string;
  temperature_unit?: 'celsius' | 'fahrenheit';
}

export interface CurrentWeather {
  temperature: number;
  weathercode: number;
  windspeed: number;
  winddirection: number;
  time: string;
  [key: string]: number | string;
}

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
  current?: CurrentWeather;
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

export const getWeatherData = async (params: WeatherApiParams): Promise<WeatherApiResponse> => {
  try {
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

export const getWeatherByCity = async (city: string): Promise<WeatherApiResponse> => {
  try {
    // In a real app, you would use a geocoding API to convert city name to coordinates
    // For this example, we'll use hardcoded coordinates for Raleigh, NC
    const coordinates = { latitude: 35.7796, longitude: -78.6382 };

    return await getWeatherData({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      current: ['temperature_2m', 'relative_humidity_2m', 'weather_code', 'wind_speed_10m', 'wind_direction_10m', 'pressure_msl'],
      hourly: ['temperature_2m', 'weather_code', 'precipitation_probability'],
      daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum'],
      timezone: 'auto'
    });
  } catch (error) {
    console.error('Error fetching weather data for city:', error);
    throw error;
  }
}

export const getWeatherCodeDescription = (code: number): string => {
  // WMO Weather interpretation codes (WW)
  // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
  const weatherCodes: {[key: number]: string} = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing Rime Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Dense Drizzle',
    56: 'Light Freezing Drizzle',
    57: 'Dense Freezing Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    66: 'Light Freezing Rain',
    67: 'Heavy Freezing Rain',71: 'Slight Snow Fall',
    73: 'Moderate Snow Fall',
    75: 'Heavy Snow Fall',
    77: 'Snow Grains',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Slight Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Slight Hail',
    99: 'Thunderstorm with Heavy Hail'
  };

  return weatherCodes[code] || 'Unknown';
}

// Helper function to convert temperature from Celsius to Fahrenheit
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
}

// Helper function to convert temperature from Fahrenheit to Celsius
export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
}

export default {
  getWeatherData,
  getWeatherByCity,
  getWeatherCodeDescription,
  celsiusToFahrenheit,
  fahrenheitToCelsius
}
