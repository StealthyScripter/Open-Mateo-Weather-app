 // Weather Icon Mapping
const weatherIconMap = {
    0: 'fa-sun',           // Clear sky
    1: 'fa-cloud-sun',     // Mainly clear
    2: 'fa-cloud-sun',     // Partly cloudy
    3: 'fa-cloud',         // Overcast
    45: 'fa-smog',         // Foggy
    51: 'fa-cloud-rain',   // Light drizzle
    53: 'fa-cloud-rain',   // Moderate drizzle
    55: 'fa-cloud-rain',   // Dense drizzle
    61: 'fa-cloud-showers-heavy', // Slight rain
    63: 'fa-cloud-showers-heavy', // Moderate rain
    65: 'fa-cloud-showers-heavy', // Heavy rain
    71: 'fa-snowflake',    // Slight snow
    73: 'fa-snowflake',    // Moderate snow
    80: 'fa-cloud-rain',   // Rain showers
    95: 'fa-bolt'          // Thunderstorm
};

// Location Management
const locationManager = {
    savedLocations: JSON.parse(localStorage.getItem('savedLocations')) || [],
    currentLocation: null,

    saveLocation(location) {
        // Check if location already exists
        const existingIndex = this.savedLocations.findIndex(
            saved => saved.name.toLowerCase() === location.name.toLowerCase()
        );

        if (existingIndex === -1) {
            // Add new location
            this.savedLocations.push(location);
        } else {
            // Update existing location
            this.savedLocations[existingIndex] = location;
        }

        // Save to local storage
        localStorage.setItem('savedLocations', JSON.stringify(this.savedLocations));
    },

    getSavedLocations() {
        return this.savedLocations;
    }
};

// Temperature Conversion
const temperatureConverter = {
    isCelsius: true,

    convertToCelsius(fahrenheit) {
        return Math.round((fahrenheit - 32) * 5 / 9);
    },

    convertToFahrenheit(celsius) {
        return Math.round((celsius * 9 / 5) + 32);
    },

    toggleUnit() {
        this.isCelsius = !this.isCelsius;
        this.updateDisplayedTemperatures();
    },

    updateDisplayedTemperatures() {
        const temperatureElements = [
            '.temperature', 
            '.feels-like', 
            '.up', 
            '.down',
            '.forecast-temp',
            '.day-temp-high',
            '.day-temp-low'
        ];

        temperatureElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {

                const matches = el.textContent.match(/(-?\d+(\.\d+)?)/);
                if (matches && matches[1]) {
                    const currentTemp = parseFloat(matches[1]);
                    const temperatureValue = this.isCelsius 
                        ? this.convertToCelsius(currentTemp) 
                        : this.convertToFahrenheit(currentTemp);

                        // Preserve the original text format, just replace the number
                if (selector === '.temperature') {
                    el.textContent = `${temperatureValue}${this.isCelsius ? '°C' : '°F'}`;
                } else if (selector === '.feels-like') {
                    el.textContent = `Feels like ${temperatureValue}${this.isCelsius ? '°C' : '°F'}`;
                } else if (selector === '.up') {
                    el.textContent = `↑ ${temperatureValue}°`;
                } else if (selector === '.down') {
                    el.textContent = `↓ ${temperatureValue}°`;
                } else {
                el.textContent = `${temperatureValue}${this.isCelsius ? '°C' : '°F'}`;
                }
            }
            });
        });

        // Update toggle button styles
        document.getElementById('celsius-btn').classList.toggle('active', this.isCelsius);
        document.getElementById('fahrenheit-btn').classList.toggle('active', !this.isCelsius);
    }
};

// Geocoding Service
async function getCoordinates(locationQuery) {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=1&language=en&format=json`);
        
        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const location = data.results[0];
            return {
                name: `${location.name}, ${location.admin1 || ''}, ${location.country || ''}`.replace(/,\s*,/, ','),
                latitude: location.latitude,
                longitude: location.longitude
            };
        }

        throw new Error('Location not found');
    } catch (error) {
        console.error('Geocoding error:', error);
        alert('Could not find coordinates for the specified location');
        return null;
    }
}

async function fetchWeatherData(location=null) {
    try {
        // Use the passed location or default to New York
        const selectedLocation = location || {
            name: 'Raleigh, North Carolina, USA',
            latitude: 35.7721,
            longitude: -78.63861
        };

        document.getElementById('location-name').textContent = selectedLocation.name;

        // Construct URL with all required parameters
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.set('latitude', selectedLocation.latitude);
        url.searchParams.set('longitude', selectedLocation.longitude);
        
        // Request all the specific data we need
        url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure');
        url.searchParams.set('hourly', 'temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,uv_index');
        url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max');
        url.searchParams.set('timezone', 'auto');

        // Fetch the data
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        locationManager.currentLocation = selectedLocation;

        // Parse the response
        const weatherData = await response.json();

        // Update Current Weather
        updateCurrentWeather(weatherData);

        // Update 24-Hour Forecast
        update24HourForecast(weatherData);

        // Update 7-Day Forecast
        update7DayForecast(weatherData);

        return weatherData;
    } catch(error) {
        console.error("Fetching weather data failed:", error);
        throw error;
    }
}

// Initialize Event Listeners
function initEventListeners() {
    // Location Search
    const locationSearch = document.getElementById('location-search');
    locationSearch.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const coordinates = await getCoordinates(locationSearch.value);
            if (coordinates) {
                fetchWeatherData(coordinates);
            }
        }
    });

    // Temperature Unit Toggle
    document.getElementById('celsius-btn').addEventListener('click', () => {
        if (!temperatureConverter.isCelsius) {
            temperatureConverter.toggleUnit();
        }
    });

    document.getElementById('fahrenheit-btn').addEventListener('click', () => {
        if (temperatureConverter.isCelsius) {
            temperatureConverter.toggleUnit();
        }
    });

    // Favorite Location Star
    const favoriteStar = document.querySelector('.star');
    favoriteStar.addEventListener('click', () => {
        const currentLocation = locationManager.currentLocation;
        if (currentLocation) {
            locationManager.saveLocation(currentLocation);
            favoriteStar.classList.toggle('active');
            alert(`Location ${currentLocation.name} saved!`);
        }
    });
}

function updateCurrentWeather(weatherData) {
    // Current Weather Condition
    const weatherCode = weatherData.current.weather_code;
    const iconClass = weatherIconMap[weatherCode] || 'fa-cloud';
    
    // Update Current Weather Section
    document.querySelector('.weather-icon i').className = `fas ${iconClass}`;
    document.querySelector('.temperature').textContent = `${Math.round(weatherData.current.temperature_2m)}°C`;
    document.querySelector('.weather-description').textContent = getWeatherDescription(weatherCode);
    
    // High and Low Temperatures
    const dailyData = weatherData.daily;
    document.querySelector('.up').textContent = `↑ ${Math.round(dailyData.temperature_2m_max[0])}°`;
    document.querySelector('.down').textContent = `↓ ${Math.round(dailyData.temperature_2m_min[0])}°`;

    
    
    // Feels Like
    document.querySelector('.feels-like').textContent = `Feels like ${Math.round(weatherData.current.apparent_temperature)}°C`;
  
    
    // Weather Details
    const windDirection = getWindDirection(weatherData.current.wind_direction_10m);
    document.querySelector('.detail-item:nth-child(1) .detail-value').textContent = `${Math.round(weatherData.current.wind_speed_10m)} km/h`;
    document.querySelector('.detail-item:nth-child(1) .detail-label').textContent = windDirection;
    
    document.querySelector('.detail-item:nth-child(2) .detail-value').textContent = `${Math.round(weatherData.current.relative_humidity_2m)}%`;
    
    document.querySelector('.detail-item:nth-child(3) .detail-value').textContent = Math.round(weatherData.hourly.uv_index[0]);
    document.querySelector('.detail-item:nth-child(3) .detail-label').textContent = getUVDescription(Math.round(weatherData.hourly.uv_index[0]));
    
    document.querySelector('.detail-item:nth-child(4) .detail-value').textContent = Math.round(weatherData.current.surface_pressure);
}

function update24HourForecast(weatherData) {
    const hourlyContainer = document.querySelector('.hourly-forecast');
    const currentHour = new Date().getHours();

    // Clear existing forecast items
    hourlyContainer.innerHTML = '';

    // Generate forecast for next 5 hours
    for (let i = 0; i < 24; i++) {
        const hourIndex = i;
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');

        // Time
        const timeSpan = document.createElement('div');
        timeSpan.classList.add('forecast-time');
        const forecastHour = (currentHour + i) % 24;
        const ampm = forecastHour >= 12 ? 'PM' : 'AM';
        const hour12 = forecastHour % 12 || 12; // Convert to 12-hour format
        timeSpan.textContent = i === 0 ? 'Now' : `${hour12}${ampm}`;

        // Icon
        const iconSpan = document.createElement('div');
        iconSpan.classList.add('forecast-icon');
        const weatherCode = weatherData.hourly.weather_code[hourIndex];
        const iconClass = weatherIconMap[weatherCode] || 'fa-cloud';
        iconSpan.innerHTML = `<i class="fas ${iconClass}"></i>`;

        // Temperature
        const tempSpan = document.createElement('div');
        tempSpan.classList.add('forecast-temp');
        tempSpan.textContent = `${Math.round(weatherData.hourly.temperature_2m[hourIndex])}°C`;

        forecastItem.appendChild(timeSpan);
        forecastItem.appendChild(iconSpan);
        forecastItem.appendChild(tempSpan);

        hourlyContainer.appendChild(forecastItem);
    }
}

function update7DayForecast(weatherData) {
    const daysContainer = document.querySelector('.daily-container');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Clear existing forecast items
    daysContainer.innerHTML = '';

    // Generate 7-day forecast
    for (let i = 0; i < 7; i++) {
        const dayForecast = document.createElement('div');
        dayForecast.classList.add('day-forecast');

        // Day Name
        const dayName = document.createElement('div');
        dayName.classList.add('day-name');
        const date = new Date();
        date.setDate(date.getDate() + i);
        dayName.textContent = days[date.getDay()];

        // Icon
        const dayIcon = document.createElement('div');
        dayIcon.classList.add('day-icon');
        const weatherCode = weatherData.daily.weather_code[i];
        const iconClass = weatherIconMap[weatherCode] || 'fa-cloud';
        dayIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;

        // High Temperature
        const dayTempHigh = document.createElement('div');
        dayTempHigh.classList.add('day-temp-high');
        dayTempHigh.textContent = `${Math.round(weatherData.daily.temperature_2m_max[i])}°`;

        // Low Temperature
        const dayTempLow = document.createElement('div');
        dayTempLow.classList.add('day-temp-low');
        dayTempLow.textContent = `${Math.round(weatherData.daily.temperature_2m_min[i])}°`;

        dayForecast.appendChild(dayName);
        dayForecast.appendChild(dayIcon);
        dayForecast.appendChild(dayTempHigh);
        dayForecast.appendChild(dayTempLow);

        daysContainer.appendChild(dayForecast);
    }
}

// Utility Functions
function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        61: 'Light Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Light Snow',
        73: 'Moderate Snow',
        95: 'Thunderstorm'
    };
    return descriptions[code] || 'Unknown Condition';
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function getUVDescription(uvIndex) {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    return 'Very High';
}

// Update Date and Time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = now.toLocaleDateString('en-US', options);
    
    // Update date in the location header
    document.querySelector('.date-info').textContent = `${formattedDate} | Last updated: ${now.toLocaleTimeString()}`;
}

// Initialize the app
function initWeatherApp() {
    // Update date/time immediately
    updateDateTime();

    // Initialize event listeners
    initEventListeners();

    
    // Fetch weather data
    fetchWeatherData();

    // Update date/time every minute
    setInterval(updateDateTime, 60000);

    // Refresh weather data every 30 minutes
    setInterval(fetchWeatherData, 1800000);
}

// Run the app when the page loads
window.addEventListener('DOMContentLoaded', initWeatherApp);