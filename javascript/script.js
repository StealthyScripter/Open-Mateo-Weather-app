 //script.js
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
        // Use the passed location or default to Raleigh, NC
        const selectedLocation = location || {
            name: 'Raleigh, NC, USA',
            latitude: 35.7721,
            longitude: -78.63861
        };
        
        //update location name in the UI
        const locationNameElement = document.getElementById('location-name');
        if(locationNameElement) {
            locationNameElement.textContent = selectedLocation.name;

            // Add favorite star icon if not present
            if (!locationNameElement.querySelector('.star')) {
                const starIcon = document.createElement('i');
                starIcon.className = 'far fa-star star';
                locationNameElement.appendChild(starIcon);
                
                // Add click event for the star
                starIcon.addEventListener('click', () => {
                    if (locationManager.currentLocation) {
                        locationManager.saveLocation(locationManager.currentLocation);
                        starIcon.classList.toggle('active');
                        alert(`Location ${locationManager.currentLocation.name} saved!`);
                    }
                });
            }

        }

        // Construct URL with all required parameters
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.set('latitude', selectedLocation.latitude);
        url.searchParams.set('longitude', selectedLocation.longitude);
        
        // Request all the specific data need
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

        const currentPath = window.location.pathname;

        if (currentPath.includes('hourly.html')) {
            initHourlyPage(weatherData);
        } else if (currentPath.includes('daily.html')) {
            initDailyPage(weatherData);
        } else {
            //Assume it is the index page
            // Update Current Weather
            updateCurrentWeather(weatherData);

            // Update 24-Hour Forecast
            update24HourForecast(weatherData);

            // Update 7-Day Forecast
            update7DayForecast(weatherData);
        }

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





//hourly-daily.js
// Specialized page initialization functions

// For hourly.html page
function initHourlyPage(weatherData) {
    if (!weatherData) return;
    
    // Update the hourly table
    updateHourlyTable(weatherData);
    
    // Create temperature trend chart
    createTemperatureChart(weatherData);
    
    // Create precipitation chart
    createPrecipitationChart(weatherData);
}

// For daily.html page
function initDailyPage(weatherData) {
    if (!weatherData) return;
    
    // Update the daily cards
    updateDailyCards(weatherData);
    
    // Create temperature range chart
    createTemperatureRangeChart(weatherData);
    
    // Create precipitation probability chart
    createPrecipProbChart(weatherData);
    
    // Create UV index chart
    createUVIndexChart(weatherData);
    
    // Update sunrise/sunset table
    updateSuntimeTable(weatherData);
}

// Function to update hourly table in hourly.html
function updateHourlyTable(weatherData) {
    const hourlyTableBody = document.getElementById('hourly-data');
    if (!hourlyTableBody) return;
    
    // Clear existing data
    hourlyTableBody.innerHTML = '';
    
    const currentHour = new Date().getHours();
    
    // Generate hourly data for the next 24 hours
    for (let i = 0; i < 24; i++) {
        const hourIndex = i;
        const row = document.createElement('tr');
        
        // Time
        const timeCell = document.createElement('td');
        const forecastHour = (currentHour + i) % 24;
        const ampm = forecastHour >= 12 ? 'PM' : 'AM';
        const hour12 = forecastHour % 12 || 12; // Convert to 12-hour format
        timeCell.textContent = i === 0 ? 'Now' : `${hour12}${ampm}`;
        
        // Condition with icon
        const conditionCell = document.createElement('td');
        const weatherCode = weatherData.hourly.weather_code[hourIndex];
        const iconClass = weatherIconMap[weatherCode] || 'fa-cloud';
        conditionCell.innerHTML = `<i class="fas ${iconClass}"></i> ${getWeatherDescription(weatherCode)}`;
        
        // Temperature
        const tempCell = document.createElement('td');
        tempCell.textContent = `${Math.round(weatherData.hourly.temperature_2m[hourIndex])}°C`;
        tempCell.classList.add('hourly-temp');
        
        // Feels like
        const feelsLikeCell = document.createElement('td');
        feelsLikeCell.textContent = `${Math.round(weatherData.hourly.apparent_temperature[hourIndex])}°C`;
        feelsLikeCell.classList.add('hourly-feels-like');
        
        // Precipitation probability
        const precipCell = document.createElement('td');
        precipCell.textContent = `${Math.round(weatherData.hourly.precipitation_probability[hourIndex])}%`;
        
        // Wind speed
        const windCell = document.createElement('td');
        windCell.textContent = `${Math.round(weatherData.hourly.wind_speed_10m[hourIndex])} km/h`;
        
        // Wind direction
        const directionCell = document.createElement('td');
        directionCell.textContent = getWindDirection(weatherData.hourly.wind_direction_10m[hourIndex]);
        
        // UV Index
        const uvCell = document.createElement('td');
        const uvIndex = Math.round(weatherData.hourly.uv_index[hourIndex]);
        uvCell.textContent = uvIndex;
        uvCell.setAttribute('title', getUVDescription(uvIndex));
        
        // Add all cells to the row
        row.appendChild(timeCell);
        row.appendChild(conditionCell);
        row.appendChild(tempCell);
        row.appendChild(feelsLikeCell);
        row.appendChild(precipCell);
        row.appendChild(windCell);
        row.appendChild(directionCell);
        row.appendChild(uvCell);
        
        hourlyTableBody.appendChild(row);
    }
}

// Function to update daily cards in daily.html
function updateDailyCards(weatherData) {
    const dailyCardsContainer = document.getElementById('daily-cards');
    if (!dailyCardsContainer) return;
    
    // Clear existing data
    dailyCardsContainer.innerHTML = '';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Generate 7-day forecast cards
    for (let i = 0; i < 7; i++) {
        const card = document.createElement('div');
        card.classList.add('daily-card');
        
        // Date
        const dateElement = document.createElement('div');
        dateElement.classList.add('daily-date');
        const date = new Date();
        date.setDate(date.getDate() + i);
        dateElement.textContent = i === 0 ? 'Today' : days[date.getDay()];
        
        // Weather icon and description
        const weatherInfo = document.createElement('div');
        weatherInfo.classList.add('daily-weather-info');
        const weatherCode = weatherData.daily.weather_code[i];
        const iconClass = weatherIconMap[weatherCode] || 'fa-cloud';
        weatherInfo.innerHTML = `
            <div class="daily-icon"><i class="fas ${iconClass}"></i></div>
            <div class="daily-condition">${getWeatherDescription(weatherCode)}</div>
        `;
        
        // Temperature range
        const tempRange = document.createElement('div');
        tempRange.classList.add('daily-temp-range');
        tempRange.innerHTML = `
            <span class="daily-high">${Math.round(weatherData.daily.temperature_2m_max[i])}°C</span>
            <span class="daily-low">${Math.round(weatherData.daily.temperature_2m_min[i])}°C</span>
        `;
        
        // Additional details
        const details = document.createElement('div');
        details.classList.add('daily-details');
        details.innerHTML = `
            <div class="detail-row">
                <span>Precipitation:</span>
                <span>${weatherData.daily.precipitation_probability_max[i]}%</span>
            </div>
            <div class="detail-row">
                <span>Wind:</span>
                <span>${Math.round(weatherData.daily.wind_speed_10m_max[i])} km/h</span>
            </div>
            <div class="detail-row">
                <span>UV Index:</span>
                <span>${Math.round(weatherData.daily.uv_index_max[i])} (${getUVDescription(Math.round(weatherData.daily.uv_index_max[i]))})</span>
            </div>
        `;
        
        // Add all elements to the card
        card.appendChild(dateElement);
        card.appendChild(weatherInfo);
        card.appendChild(tempRange);
        card.appendChild(details);
        
        dailyCardsContainer.appendChild(card);
    }
}

// Function to update sunrise/sunset table
function updateSuntimeTable(weatherData) {
    const suntimeBody = document.getElementById('suntime-data');
    if (!suntimeBody) return;
    
    // Clear existing data
    suntimeBody.innerHTML = '';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Generate 7-day sunrise/sunset data
    for (let i = 0; i < 7; i++) {
        const row = document.createElement('tr');
        
        // Day
        const dayCell = document.createElement('td');
        const date = new Date();
        date.setDate(date.getDate() + i);
        dayCell.textContent = i === 0 ? 'Today' : days[date.getDay()];
        
        // Sunrise
        const sunriseCell = document.createElement('td');
        const sunriseTime = new Date(weatherData.daily.sunrise[i]);
        sunriseCell.textContent = sunriseTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Sunset
        const sunsetCell = document.createElement('td');
        const sunsetTime = new Date(weatherData.daily.sunset[i]);
        sunsetCell.textContent = sunsetTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Daylight hours
        const daylightCell = document.createElement('td');
        const daylightMs = sunsetTime - sunriseTime;
        const daylightHours = Math.floor(daylightMs / (1000 * 60 * 60));
        const daylightMinutes = Math.floor((daylightMs % (1000 * 60 * 60)) / (1000 * 60));
        daylightCell.textContent = `${daylightHours}h ${daylightMinutes}m`;
        
        // Add all cells to the row
        row.appendChild(dayCell);
        row.appendChild(sunriseCell);
        row.appendChild(sunsetCell);
        row.appendChild(daylightCell);
        
        suntimeBody.appendChild(row);
    }
}

// Simple chart creation functions (placeholders - in a real implementation these would use canvas or SVG)
function createTemperatureChart(weatherData) {
    const chartContainer = document.getElementById('temperature-chart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '<div class="chart-placeholder">Temperature chart visualization would be rendered here</div>';
}

function createPrecipitationChart(weatherData) {
    const chartContainer = document.getElementById('precipitation-chart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '<div class="chart-placeholder">Precipitation chart visualization would be rendered here</div>';
}

function createTemperatureRangeChart(weatherData) {
    const chartContainer = document.getElementById('temperature-range-chart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '<div class="chart-placeholder">Temperature range chart visualization would be rendered here</div>';
}

function createPrecipProbChart(weatherData) {
    const chartContainer = document.getElementById('precipitation-prob-chart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '<div class="chart-placeholder">Precipitation probability chart visualization would be rendered here</div>';
}

function createUVIndexChart(weatherData) {
    const chartContainer = document.getElementById('uv-index-chart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '<div class="chart-placeholder">UV Index chart visualization would be rendered here</div>';
}

// Modify temperature conversion to handle page-specific elements
temperatureConverter.updateDisplayedTemperatures = function() {
    // Define selectors for each page type
    const commonSelectors = ['.temperature', '.feels-like', '.up', '.down'];
    const indexSelectors = ['.forecast-temp', '.day-temp-high', '.day-temp-low'];
    const hourlySelectors = ['.hourly-temp', '.hourly-feels-like'];
    const dailySelectors = ['.daily-high', '.daily-low'];
    
    // Determine which page we're on
    const isIndex = document.querySelector('.hourly-forecast') !== null;
    const isHourly = document.querySelector('.hourly-table') !== null;
    const isDaily = document.querySelector('.daily-cards-container') !== null;
    
    // Combine the appropriate selectors
    let temperatureElements = [...commonSelectors];
    if (isIndex) temperatureElements = [...temperatureElements, ...indexSelectors];
    if (isHourly) temperatureElements = [...temperatureElements, ...hourlySelectors];
    if (isDaily) temperatureElements = [...temperatureElements, ...dailySelectors];
    
    temperatureElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            const matches = el.textContent.match(/(-?\d+(\.\d+)?)/);
            if (matches && matches[1]) {
                const currentTemp = parseFloat(matches[1]);
                const newTemp = this.isCelsius 
                    ? this.convertToCelsius(currentTemp) 
                    : this.convertToFahrenheit(currentTemp);
                
                // Preserve the original text format, just replace the number
                if (selector === '.temperature') {
                    el.textContent = `${newTemp}${this.isCelsius ? '°C' : '°F'}`;
                } else if (selector === '.feels-like') {
                    el.textContent = `Feels like ${newTemp}${this.isCelsius ? '°C' : '°F'}`;
                } else if (selector === '.up') {
                    el.textContent = `↑ ${newTemp}°`;
                } else if (selector === '.down') {
                    el.textContent = `↓ ${newTemp}°`;
                } else {
                    el.textContent = el.textContent.replace(matches[1], newTemp) + (el.textContent.includes('°') ? '' : (this.isCelsius ? '°C' : '°F'));
                }
            }
        });
    });

    // Update toggle button styles
    const celsiusBtn = document.getElementById('celsius-btn');
    const fahrenheitBtn = document.getElementById('fahrenheit-btn');
    if (celsiusBtn && fahrenheitBtn) {
        celsiusBtn.classList.toggle('active', this.isCelsius);
        fahrenheitBtn.classList.toggle('active', !this.isCelsius);
    }
};










// Add error handling function
function showErrorMessage(message) {
    // Create an error notification if it doesn't exist
    let errorNotification = document.getElementById('error-notification');
    
    if (!errorNotification) {
        errorNotification = document.createElement('div');
        errorNotification.id = 'error-notification';
        errorNotification.classList.add('error-notification');
        document.body.appendChild(errorNotification);
    }
    
    errorNotification.textContent = message;
    errorNotification.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorNotification.classList.remove('show');
    }, 5000);
}

// Modified initialization function
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