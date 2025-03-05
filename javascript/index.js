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

async function fetchWeatherData() {
    try {
        // Coordinates for New York City
        const latitude = 40.7128;
        const longitude = -74.0060;

        // Construct URL with all required parameters
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.set('latitude', latitude);
        url.searchParams.set('longitude', longitude);
        
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
    for (let i = 0; i < 5; i++) {
        const hourIndex = currentHour + i;
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');

        // Time
        const timeSpan = document.createElement('div');
        timeSpan.classList.add('forecast-time');
        timeSpan.textContent = i === 0 ? 'Now' : `${(currentHour + i) % 24}:00`;

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
    
    // Fetch weather data
    fetchWeatherData();

    // Update date/time every minute
    setInterval(updateDateTime, 60000);

    // Refresh weather data every 30 minutes
    setInterval(fetchWeatherData, 1800000);
}

// Run the app when the page loads
window.addEventListener('DOMContentLoaded', initWeatherApp);