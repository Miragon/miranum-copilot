<template>
    <div class="sidebar-container">
        <button :style="buttonStyle" @click="toggleSidebar">
            <div class="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </button>
        <div id="sidebar" :class="{ show: isSidebarVisible }">
            <!-- Sidebar content -->
            <p>Here is some sample content for the sidebar.</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import "./css/style.css";

export default defineComponent({
    name: "Sidebar",
    setup(props, { emit }) {
        const isSidebarVisible = ref(false);

        const toggleSidebar = () => {
            isSidebarVisible.value = !isSidebarVisible.value;
            emit("sidebarToggled", isSidebarVisible.value);
        };

        const buttonStyle = computed(() => {
            return {
                left: isSidebarVisible.value ? "33%" : "0",
            };
        });

        return {
            isSidebarVisible,
            toggleSidebar,
            buttonStyle,
        };
    },
});
</script>
