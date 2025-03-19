<script setup lang="ts">
</script>

<template class="app-footer">
  <div>
    <p>Powered by Open-Meteo Weather API</p>
  <div class="social-links">
    <a href="#" class="social-link" aria-label="Email">
      <i class="fas fa-envelope"></i><span class="sr-only">Email</span>
    </a>
    <a href="#" class="social-link" aria-label="Phone">
      <i class="fas fa-phone-alt"></i><span class="sr-only">Phone</span>
    </a>
    <a href="#" class="social-link" aria-label="Twitter">
      <i class="fab fa-twitter"></i><span class="sr-only">Twitter</span>
    </a>
    <a href="#" class="social-link" aria-label="GitHub">
      <i class="fab fa-github"></i><span class="sr-only">GitHub</span>
    </a>
  </div>
  </div>

</template>


<style scoped>
  .app-footer {
    background-color: #2c3e50;
    color: white;
    padding: 16px;
    display: flex;
    font-size: 0.9rem;
  }

  .social-links {
    display: flex;
    gap: 16px;
  }

  .social-link {
    color: #2c3e50;
    text-decoration: none;
    font-size: 1.5rem;  /* Adjust icon size */
  }

  .social-link:hover {
    color: #3498db; /* Optional: Add hover effect */
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
</style>
