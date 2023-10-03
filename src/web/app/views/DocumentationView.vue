<script lang="ts" setup>
import { ref } from "vue";

import { getVsCode, VsCode } from "@/composables";
import { DocumentationPrompt, OutputFormat } from "../../../shared/types";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

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

<style scoped></style>