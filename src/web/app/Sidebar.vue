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
            <ul>
                <li
                    v-for="category in categories"
                    :key="category.name"
                    @click="selectCategory(category.name)"
                >
                    {{ category.name }}
                    <span class="expand-icon">{{
                        selectedCategory === category.name ? "▼" : "▶"
                    }}</span>
                    <ul v-if="selectedCategory === category.name">
                        <li v-for="prompt in category.prompts" :key="prompt">
                            {{ prompt }}
                        </li>
                    </ul>
                </li>
            </ul>
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
        const selectedCategory = ref("");
        const categories = ref([
            {
                name: "Category 1",
                prompts: ["Prompt 1.1", "Prompt 1.2", "Prompt 1.3", "Prompt 1.4"],
            },
            {
                name: "Category 2",
                prompts: ["Prompt 2.1", "Prompt 2.2", "Prompt 2.3", "Prompt 2.4"],
            },
            {
                name: "Category 3",
                prompts: ["Prompt 3.1", "Prompt 3.2", "Prompt 3.3", "Prompt 3.4"],
            },
            {
                name: "Category 4",
                prompts: ["Prompt 4.1", "Prompt 4.2", "Prompt 4.3", "Prompt 4.4"],
            },
        ]);

        const selectCategory = (categoryName: string) => {
            if (selectedCategory.value === categoryName) {
                selectedCategory.value = "";
            } else {
                selectedCategory.value = categoryName;
            }
        };

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
            categories,
            selectedCategory,
            selectCategory,
        };
    },
});
</script>
