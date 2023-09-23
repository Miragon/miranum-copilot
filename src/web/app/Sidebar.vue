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
                    v-for="category in categories.categories"
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

<script lang="ts" setup>
import "./css/style.css";

import { computed, defineProps, ref } from "vue";
import { TemplatePrompts } from "@/composables/types";

interface Props {
    prompts: TemplatePrompts;
}

const props = defineProps<Props>();
const emit = defineEmits(["sidebarToggled"]);

const isSidebarVisible = ref(false);
const selectedCategory = ref("");

const categories = props.prompts;

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
</script>