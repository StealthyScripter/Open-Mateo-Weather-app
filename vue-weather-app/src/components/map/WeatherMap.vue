<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useWeatherStore } from '@/stores/weather';
import { storeToRefs } from 'pinia';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getCityCoordinates } from '@/utils/locationUtils';
import { geocodePlace } from '@/services/geocodingService';
import WeatherPopup from './WeatherPopup.vue';
import RouteWeather from './RouteWeather.vue';
import { getWeatherAtTime } from '@/utils/mapUtils';
import '../../assets/mapStyles.css';
import { useConfigStore } from '@/stores/config';

// Initialize the weather store
const weatherStore = useWeatherStore();
const {
  currentWeather,
  hourlyForecast,
  locationName,
  temperatureUnit
} = storeToRefs(weatherStore);

// Map configuration
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<mapboxgl.Map | null>(null);
const configStore = useConfigStore();
const mapboxToken = configStore.mapboxToken;

if (!mapboxToken) {
  console.error('Mapbox token is missing. Please set VITE_MAPBOX_TOKEN in your .env file.')
}

// Navigation state
const isNavigationMode = ref(false);
const startLocation = ref('');
const endLocation = ref('');
const routeEta = ref<Date | null>(null);
const routePoints = ref<any[]>([]);
const selectedHourOffset = ref(0);

// Weather marker for displaying specific forecast points
const weatherMarker = ref<mapboxgl.Marker | null>(null);
const weatherPopup = ref<mapboxgl.Popup | null>(null);

// Current coordinates based on selected location
const coordinates = computed(() => {
  return getCityCoordinates(locationName.value);
});

// Selected weather data for popup display
const selectedWeatherData = ref<any>(null);

// Initialize map
onMounted(() => {
  if (!mapContainer.value) return;

  mapboxgl.accessToken = mapboxToken;

  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [coordinates.value.longitude, coordinates.value.latitude],
    zoom: 9
  });

  map.value.on('load', () => {
    addWeatherMarker();

    // Add navigation controls
    map.value?.addControl(new mapboxgl.NavigationControl(), 'top-right');
  });
});

// Watch for location changes
watch(() => locationName.value, () => {
  if (!map.value) return;

  // Update map center when location changes
  map.value.flyTo({
    center: [coordinates.value.longitude, coordinates.value.latitude],
    zoom: 9,
    essential: true
  });

  // Update weather marker
  updateWeatherMarker();
});

// Add weather marker to map
const addWeatherMarker = () => {
  if (!map.value) return;

  // Remove existing marker if it exists
  if (weatherMarker.value) {
    weatherMarker.value.remove();
  }

  // Create a custom element for the marker
  const el = document.createElement('div');
  el.className = 'weather-marker';

  // Create weather icon and details
  if (currentWeather.value) {
    updateMarkerContent(el);
  }

  // Create new marker
  weatherMarker.value = new mapboxgl.Marker(el)
    .setLngLat([coordinates.value.longitude, coordinates.value.latitude])
    .addTo(map.value);
};

// Update weather marker content
const updateWeatherMarker = () => {
  if (!weatherMarker.value || !map.value) return;

  // Update marker position
  weatherMarker.value.setLngLat([coordinates.value.longitude, coordinates.value.latitude]);

  // Update marker content
  const el = weatherMarker.value.getElement();
  updateMarkerContent(el);
};

// Update marker content with weather info
const updateMarkerContent = (el: HTMLElement) => {
  if (!currentWeather.value) return;

  // Get the right weather data (current or based on hour offset)
  const weatherData = currentWeather.value;
  let weatherCondition = weatherData.condition;
  let temperature = weatherData.temperature;

  // If in navigation mode and we have hourly data, show forecast for ETA
  if (isNavigationMode.value && hourlyForecast.value.length > 0 && selectedHourOffset.value > 0) {
    const hourData = hourlyForecast.value[selectedHourOffset.value];
    if (hourData) {
      weatherCondition = hourData.condition || weatherCondition;
      temperature = hourData.temp;
    }
  }

  // Format temperature based on unit
  const tempUnit = temperatureUnit.value === 'celsius' ? 'C' : 'F';
  const formattedTemp = `${Math.round(temperature)}°${tempUnit}`;

  // Get emoji for weather condition
  const weatherEmoji = getWeatherEmoji(weatherCondition);

  // Create HTML content for marker
  el.innerHTML = `
    <div class="weather-icon">${weatherEmoji}</div>
    <div class="weather-temp">${formattedTemp}</div>
  `;
};

// Get emoji for weather condition
const getWeatherEmoji = (condition: string) => {
  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes('clear')) return '☀️';
  if (lowerCondition.includes('partly cloudy')) return '⛅';
  if (lowerCondition.includes('cloud')) return '☁️';
  if (lowerCondition.includes('fog')) return '🌫️';
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return '🌧️';
  if (lowerCondition.includes('shower')) return '🌦️';
  if (lowerCondition.includes('snow')) return '❄️';
  if (lowerCondition.includes('thunder')) return '⛈️';

  return '☀️'; // Default
};

// Toggle navigation mode
const toggleNavigationMode = () => {
  isNavigationMode.value = !isNavigationMode.value;

  // Reset route data when turning off navigation
  if (!isNavigationMode.value) {
    startLocation.value = '';
    endLocation.value = '';
    routeEta.value = null;
    routePoints.value = [];
    selectedHourOffset.value = 0;

    // Remove route from map if it exists
    if (map.value && map.value.getSource('route')) {
      map.value.removeLayer('route');
      map.value.removeSource('route');
    }

    // Update marker to show current weather
    updateWeatherMarker();
  }
};

// Calculate route between locations
const calculateRoute = async () => {
  if (!map.value || !startLocation.value || !endLocation.value) return;

  try {
    // Get coordinates for start and end locations using the geocoding service
    const startCoords = await geocodePlace(startLocation.value, mapboxToken);
    const endCoords = await geocodePlace(endLocation.value, mapboxToken);

    // Call Mapbox Directions API to get route
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords.longitude},${startCoords.latitude};${endCoords.longitude},${endCoords.latitude}?steps=true&geometries=geojson&access_token=${mapboxToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];

      // Store route geometry points
      routePoints.value = route.geometry.coordinates;

      // Calculate ETA based on current time plus duration
      const durationInSeconds = route.duration;
      const now = new Date();
      routeEta.value = new Date(now.getTime() + durationInSeconds * 1000);

      // Calculate hour offset for weather forecast
      const hourDiff = Math.floor(durationInSeconds / 3600);
      selectedHourOffset.value = Math.min(hourDiff, hourlyForecast.value.length - 1);

      // Draw route on map
      drawRoute();

      // Update marker to show weather at ETA
      updateWeatherMarker();
    }
  } catch (error) {
    console.error('Error calculating route:', error);
  }
};

// Draw route on map
const drawRoute = () => {
  if (!map.value || routePoints.value.length === 0) return;

  // Remove previous route if it exists
  if (map.value.getSource('route')) {
    map.value.removeLayer('route');
    map.value.removeSource('route');
  }

  // Add route source and layer
  map.value.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routePoints.value
      }
    }
  });

  map.value.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#4a6fa5',
      'line-width': 8
    }
  });

  // Fit map to show entire route
  const bounds = new mapboxgl.LngLatBounds();
  routePoints.value.forEach(point => {
    bounds.extend([point[0], point[1]]);
  });

  map.value.fitBounds(bounds, {
    padding: 50
  });
};

// Update hour offset for weather forecast along route
const updateHourOffset = (offset: number) => {
  selectedHourOffset.value = offset;
  updateWeatherMarker();
};

// Format ETA time for display
const formattedEta = computed(() => {
  if (!routeEta.value) return '';

  return routeEta.value.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Show weather popup with detailed information
const showWeatherPopup = () => {
  if (!map.value || !weatherMarker.value || !selectedWeatherData.value) return;

  // Remove existing popup if it exists
  if (weatherPopup.value) {
    weatherPopup.value.remove();
  }

  // Get current or forecast time based on mode
  let timeDisplay = 'Current Weather';
  if (isNavigationMode.value && routeEta.value) {
    if (selectedHourOffset.value === 0) {
      timeDisplay = 'Current Weather';
    } else {
      timeDisplay = `Forecast for ${formattedEta.value}`;
    }
  }

  // Create popup element
  const popupElement = document.createElement('div');

  // Create Vue app for the popup content
  const { createApp } = require('vue');
  const popupApp = createApp(WeatherPopup, {
    weather: selectedWeatherData.value,
    location: locationName.value,
    time: timeDisplay,
    unit: temperatureUnit.value === 'celsius' ? 'C' : 'F'
  });

  // Mount the app to the popup element
  popupApp.mount(popupElement);

  // Create and show the Mapbox popup
  weatherPopup.value = new mapboxgl.Popup({ offset: 25 })
    .setLngLat([coordinates.value.longitude, coordinates.value.latitude])
    .setDOMContent(popupElement)
    .addTo(map.value);
};

// Get weather data for a specific route time
const getRouteWeatherData = (time: Date) => {
  if (!hourlyForecast.value || hourlyForecast.value.length === 0) {
    return currentWeather.value;
  }

  const weatherAtTime = getWeatherAtTime(hourlyForecast.value, time);

  if (!weatherAtTime) {
    return currentWeather.value;
  }

  return {
    ...currentWeather.value,
    temperature: weatherAtTime.temp,
    condition: weatherAtTime.condition || currentWeather.value.condition
  };
};

// Handle time selection change from RouteWeather component
const onSelectedTimeChange = (time: Date) => {
  selectedWeatherData.value = getRouteWeatherData(time);
  updateWeatherMarker();
};
</script>

<template>
  <div class="weather-map-container">
    <!-- Map Controls -->
    <div class="map-controls">
      <div class="toggle-nav">
        <button @click="toggleNavigationMode" :class="{ active: isNavigationMode }">
          {{ isNavigationMode ? 'Exit Navigation' : 'Start Navigation' }}
        </button>
      </div>

      <!-- Navigation Form -->
      <div v-if="isNavigationMode" class="nav-form">
        <div class="input-group">
          <label for="start-location">Start:</label>
          <input
            type="text"
            id="start-location"
            v-model="startLocation"
            placeholder="Enter start location"
          >
        </div>

        <div class="input-group">
          <label for="end-location">Destination:</label>
          <input
            type="text"
            id="end-location"
            v-model="endLocation"
            placeholder="Enter destination"
          >
        </div>

        <button @click="calculateRoute" class="route-btn">Get Route</button>
      </div>

      <!-- Route ETA and Weather Selection -->
      <RouteWeather
        v-if="isNavigationMode && routeEta"
        :etaTime="routeEta"
        :routeDuration="routeEta ? (routeEta.getTime() - new Date().getTime()) / 60000 : 0"
        @update:selectedTime="onSelectedTimeChange"
      />
    </div>

    <!-- Map Container -->
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.weather-map-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.map-container {
  flex: 1;
  width: 100%;
  min-height: 500px;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.map-controls {
  background-color: var(--color-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow);
}

.toggle-nav {
  margin-bottom: var(--spacing-md);
}

.toggle-nav button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 600;
}

.toggle-nav button.active {
  background-color: var(--color-primary);
}

.nav-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.input-group {
  flex: 1;
  min-width: 200px;
}

.input-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.input-group input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
}

.route-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  align-self: flex-end;
}

.route-info {
  background-color: var(--color-background);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}

.eta-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.time-selector {
  margin-top: var(--spacing-sm);
}

.hour-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: var(--spacing-sm);
}

.hour-buttons button {
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background-color: white;
  cursor: pointer;
}

.hour-buttons button.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Weather marker styling */
:global(.weather-marker) {
  width: 70px;
  height: 70px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

:global(.weather-icon) {
  font-size: 2rem;
}

:global(.weather-temp) {
  font-size: 1rem;
  font-weight: bold;
}
</style>
