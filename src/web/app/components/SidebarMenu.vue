<script lang="ts" setup>
import { computed, ref } from "vue";
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";

import { DefaultPrompt } from "../../../shared";
import { TemplatePrompts } from "@/composables/types";

import "../css/style.css";

provideVSCodeDesignSystem().register(vsCodeButton());

interface Props {
    prompts: TemplatePrompts;
}

const props = defineProps<Props>();
const emits = defineEmits(["sidebarToggled", "promptSelected", "documentationSelected"]);

const isSidebarVisible = ref(false);
const selectedCategory = ref("");

const categories = computed(() => props.prompts.categories);
const buttonStyle = computed(() => {
    return {
        left: isSidebarVisible.value ? "33%" : "0",
    };
});

const selectCategory = (categoryName: string) => {
    if (selectedCategory.value === categoryName) {
        selectedCategory.value = "";
    } else {
        selectedCategory.value = categoryName;
    }
};

const selectPrompt = (prompt: DefaultPrompt) => {
    emits("promptSelected", prompt);
};

const toggleSidebar = () => {
    isSidebarVisible.value = !isSidebarVisible.value;
    emits("sidebarToggled", isSidebarVisible.value);
};
</script>

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
                        <li
                            v-for="prompt in category.prompts"
                            :key="prompt.text"
                            @click="selectPrompt(prompt)"
                        >
                            {{ prompt.text }}
                        </li>
                    </ul>
                </li>
            </ul>
            <vscode-button @click="$emit('documentationSelected')">
                Process Documentation
            </vscode-button>
        </div>
    </div>
</template>

<style scoped>
#sidebar {
    width: 33%;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    background-color: #202020;
    overflow-y: auto;
    transition: transform 0.3s ease-in-out;
    transform: translateX(-100%);
    padding: 1rem;
}

#sidebar.show {
    transform: translateX(0);
}

.sidebar-container {
    position: relative;
}

button {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    transition: left 0.3s ease-in-out;
    background-color: #383838;
    color: #e0e0e0;
}

.hamburger-icon {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 19px;
}

.hamburger-icon span {
    display: block;
    width: 20px;
    height: 3px;
    background-color: #e0e0e0;
}

#sidebar ul {
    list-style-type: none;
    padding: 0;
}

#sidebar li {
    margin: 10px 0;
    padding: 15px;
    border: 1px solid #444;
    border-radius: 8px;
    cursor: pointer;
    transition:
        background-color 0.3s,
        transform 0.2s;
    background-color: #303030;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #e0e0e0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

#sidebar li:hover {
    background-color: #404040;
    transform: scale(1.02);
}

#sidebar li ul li {
    border: none;
    margin: 20px 0;
    padding: 20px;
    cursor: default;
    font-size: 22px;
    text-align: left;
    font-weight: normal;
    line-height: 2;
    color: #e0e0e0;
}

.expand-icon {
    float: right;
    transition: transform 0.3s;
}

#sidebar li:hover .expand-icon {
    transform: rotate(90deg);
}
</style>