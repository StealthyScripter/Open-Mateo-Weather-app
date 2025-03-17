<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheHeader from './components/layout/TheHeader.vue'
</script>

<template>
  <div class="weather-app">
    <TheHeader />
    <main class="main-content">
      <RouterView />
    </main>
    <footer class="app-footer">
      <p>Powered by Open-Meteo Weather API</p>
      <div class="social-links">
        <a href="#" class="social-link"><span class="sr-only">Email</span></a>
        <a href="#" class="social-link"><span class="sr-only">Phone</span></a>
        <a href="#" class="social-link"><span class="sr-only">Twitter</span></a>
        <a href="#" class="social-link"><span class="sr-only">GitHub</span></a>
      </div>
    </footer>
  </div>
</template>

<style>
:root {
  --color-primary: #2c3e50;
  --color-secondary: #4682B4;
  --color-background: #f5f7fa;
  --color-card: #ffffff;
  --color-text: #333333;
  --color-text-light: #666666;
  --color-border: #e2e8f0;
  --border-radius: 8px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

body {
  font-family: 'Arial', sans-serif;
  background-color: var(--color-background);
  color: var(--color-text);
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

.weather-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: var(--spacing-md);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.social-links {
  display: flex;
  gap: var(--spacing-md);
}

.social-link {
  color: white;
  text-decoration: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Card styles */
.weather-card {
  background-color: var(--color-card);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.weather-card h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--color-primary);
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Grid layout for forecast items */
.forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .forecast-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 480px) {
  .forecast-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
