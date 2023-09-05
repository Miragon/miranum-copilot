<template>
    <div>
      <!-- Button to toggle the visibility of the sidebar -->
      <button @click="toggleSidebar">Show Sidebar</button>
      
      <!-- The sidebar itself -->
      <div v-if="isSidebarVisible" id="sidebar">
        <!-- Sidebar content -->
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { ref } from 'vue';
  
  export default {
    name: 'Sidebar',
    setup() {
      // State to manage the visibility of the sidebar
      const isSidebarVisible = ref(false);
  
      // Function to toggle the visibility of the sidebar
      function toggleSidebar() {
        isSidebarVisible.value = !isSidebarVisible.value;
      }
  
      return {
        isSidebarVisible,
        toggleSidebar
      };
    }
  };
  </script>
  
  <style scoped src="./style.css"></style>
  