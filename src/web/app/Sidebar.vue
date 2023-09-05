<template>
    <div>
      <button @click="toggleSidebar">Toggle Sidebar</button>
      <div id="sidebar" v-show="isSidebarVisible">
        <!-- Sidebar content -->
        <p>Here is some sample content for the sidebar.</p>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import "./css/style.css";
  
  export default defineComponent({
    name: 'Sidebar',
    setup() {
      const isSidebarVisible = ref(false);
  
      const toggleSidebar = () => {
        isSidebarVisible.value = !isSidebarVisible.value;
      };
  
      return {
        isSidebarVisible,
        toggleSidebar
      };
    }
  });
  </script>
  
  <style scoped>
  #sidebar {
      width: 33%;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      background-color: #f9f9f9;
      overflow-y: auto;
      transition: transform 0.3s ease-in-out;
      transform: translateX(-100%);
      padding: 1rem;
  }
  
  #sidebar.show {
      transform: translateX(0);
  }
  </style>
  