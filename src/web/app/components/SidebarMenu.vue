<script lang="ts" setup>
import { computed, ref } from "vue";
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";
import { DefaultPrompt } from "../../../shared";

provideVSCodeDesignSystem().register(vsCodeButton());

interface Props {
    prompts: Map<string, DefaultPrompt[]>;
}

const props = defineProps<Props>();
const emits = defineEmits(["sidebarToggled", "promptSelected"]);

const isSidebarVisible = ref(false);
const selectedCategory = ref("");

const buttonStyle = computed(() => {
    return {
        left: isSidebarVisible.value ? `44%` : "0",
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
        <vscode-button :style="buttonStyle" class="menu-btn" @click="toggleSidebar">
            <span class="codicon codicon-menu"></span>
        </vscode-button>
        <div id="sidebar" :class="{ show: isSidebarVisible }">
            <!-- Sidebar content -->
            <ul>
                <li
                    v-for="category in props.prompts.keys()"
                    :key="category"
                    @click="selectCategory(category)"
                >
                    {{ category }}
                    <span class="expand-icon">{{
                        selectedCategory === category ? "▼" : "▶"
                    }}</span>
                    <ul v-if="selectedCategory === category">
                        <li
                            v-for="prompt in props.prompts.get(category)"
                            :key="prompt.prompt"
                            @click="selectPrompt(prompt)"
                        >
                            {{ prompt.prompt }}
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
#sidebar {
    width: 44%;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    background-color: var(--vscode-editor-background);
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

.menu-btn {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    transition: left 0.3s ease-in-out;
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
    background-color: var(--vscode-editor-background);
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: var(--vscode-editor-foreground);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

#sidebar li:hover {
    background-color: var(--vscode-editor-hoverHighlightBackground);
    transform: scale(1.02);
}

#sidebar li ul li {
    border: none;
    margin: 20px 0;
    padding: 20px;
    cursor: default;
    font-size: 16px;
    text-align: left;
    font-weight: normal;
    line-height: 2;
    color: var(--vscode-editor-foreground);
}

.expand-icon {
    float: right;
    transition: transform 0.3s;
}

#sidebar li:hover .expand-icon {
    transform: rotate(90deg);
}
</style>
