<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <span class="logo-icon">🌤️</span>
        <span class="logo-text">WeatherScope</span>
      </div>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search location..."
          class="search-input"
        />
      </div>

      <div class="user-actions">
        <button class="icon-button notifications-button">🔔</button>
        <button class="icon-button user-profile-button">👤</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-md);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.logo-icon {
  margin-right: var(--spacing-sm);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 6px 12px;
  flex: 0 1 300px;
}

.search-icon {
  margin-right: var(--spacing-sm);
}

.search-input {
  background: transparent;
  border: none;
  color: white;
  outline: none;
  width: 100%;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.user-actions {
  display: flex;
  gap: var(--spacing-md);
}

.icon-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: var(--spacing-sm);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .search-bar {
    flex: 1;
    width: 100%;
  }
}
</style>
