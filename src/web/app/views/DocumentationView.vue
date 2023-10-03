<script lang="ts" setup>
import { ref } from "vue";
import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeDropdown,
    vsCodeOption,
    vsCodeTextField,
} from "@vscode/webview-ui-toolkit";

import { DocumentationPrompt, OutputFormat } from "../../../shared";
import { getVsCode, VsCode } from "@/composables";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

provideVSCodeDesignSystem().register(
    vsCodeButton(),
    vsCodeDropdown(),
    vsCodeOption(),
    vsCodeTextField(),
);

interface Props {
    loading: boolean;
}

const vscode: VsCode = getVsCode();
const props = defineProps<Props>();
const emits = defineEmits(["sendPrompt"]);

let prompt: DocumentationPrompt = {
    template: "",
    format: OutputFormat.md as OutputFormat,
};

let templatePath = ref("");
const outputFormats = ref<OutputFormat[]>([OutputFormat.json, OutputFormat.md]);
const loading = ref(props.loading);

function generateDocumentation() {
    emits("sendPrompt", prompt);
}

function updatePath() {
    prompt.template = templatePath.value;
    vscode.updateState({ currentPrompt: { template: templatePath.value } });
}

function handleSelectedFormat(format: OutputFormat) {
    prompt.format = format;
    vscode.updateState({ currentPrompt: { format: format } });
}
</script>

<template>
    <div v-if="!loading">
        <vscode-text-field v-model="templatePath" @input="updatePath">
            Path to the template (keep empty to use the default)
        </vscode-text-field>
        <vscode-dropdown>
            <vscode-option
                v-for="format in outputFormats"
                :key="format"
                @click="handleSelectedFormat(format)"
            >
                {{ format }}
            </vscode-option>
        </vscode-dropdown>
        <vscode-button @click="generateDocumentation">Generate</vscode-button>
    </div>
    <div v-else>
        <LoadingAnimation />
    </div>
</template>

<style scoped>
vscode-text-field {
    min-height: inherit;
    width: 100%;
    margin-bottom: var(--margin);
    padding: 10px;
    border-radius: 4px;
    border: 1px solid var(--vscode-dropdown-background);
}

vscode-dropdown {
    min-height: inherit;
    width: 100%;
    margin-bottom: var(--margin);
}

vscode-button {
    width: 100%;
    padding: 10px;
    transition: background-color 0.3s ease;
}
</style>