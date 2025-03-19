<script setup lang="ts">
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCloudSunRain } from '@fortawesome/free-solid-svg-icons'
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'

const searchQuery = ref('')

library.add(faCloudSunRain)
library.add(faMapMarkerAlt)

</script>

<template>
  <div class="header">
    <div class="logo">
      <FontAwesomeIcon icon="cloud-sun-rain" />
      <span class="logo-text">WeatherScope</span>
    </div>

    <!--Search, notification and profile icons-->
    <div class="header-right">
      <div class="search-container">
        <FontAwesomeIcon icon="fa-map-marker-alt" />
        <input type="text" id="location-search" v-model="searchQuery" placeholder="Search location..." />
      </div>

      <div class="user-controls">
        <div class="notifications">
            <i class="far fa-bell"></i>
        </div>

        <div class="profile">
            <i class="far fa-user"></i>
        </div>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: white;
    border-bottom: 1px solid #e5e5e5;
  }

/* Logo Section */
.logo {
    display: flex;
    align-items: center;
    font-size: 1.5em;
    font-weight: bold;
}

.logo img {
    width: 32px;
    margin-right: 8px;
}

/* Right side of the header */
.header-right{
    display:flex;
    padding: 5px;
}

.search-container {
    display: flex;
    align-items: center;
    background-color: #f5f7fa;
    border-radius: 8px;
    padding: 8px 15px;
    width: 300px;
    margin-right: 10px;
}

.search-container i {
    color: #999;
    margin-right: 8px;
}

.search-container input {
    border: none;
    background: transparent;
    width: 100%;
    outline: none;
}

.user-controls {
    display: flex;
    align-items: center;
}

.user-controls .notifications {
    margin-right: 10px;
    font-size: 1.2em;
    color: #333;
    padding:5px;
}

.user-controls .profile {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #e1e5eb;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
