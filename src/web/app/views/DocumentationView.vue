<script lang="ts" setup>
import {computed, ref} from "vue";
import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeDropdown,
    vsCodeOption,
    vsCodeTextField,
} from "@vscode/webview-ui-toolkit";

import {OutputFormat} from "../../../shared";
import {getVsCode, VsCode} from "@/composables";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

provideVSCodeDesignSystem().register(
    vsCodeButton(),
    vsCodeDropdown(),
    vsCodeOption(),
    vsCodeTextField(),
);

interface Props {
    loading: boolean;
    processDropdown: string[];
    selectedBpmn: string;
}

const vscode: VsCode = getVsCode();
const props = defineProps<Props>();
const emits = defineEmits(["sendPrompt"]);

const processDropdown = computed(() => props.processDropdown);
const selectedBpmn = computed({
    get() {
        return props.selectedBpmn;
    },
    set(processName: string) {
        return processName;
    },
});
let templatePath = ref("");
const outputFormats = ref<OutputFormat[]>([OutputFormat.md, OutputFormat.json]);

const loading = computed(() => props.loading);

function generateDocumentation() {
    emits("sendPrompt");
}

function updatePath() {
    vscode.updateState({
        currentPrompt: {
            ...vscode.getState().currentPrompt,
            template: templatePath.value,
        },
    });
}

function isBpmnSelected(processName: string) {
    console.log("isBpmnSelected", processName, selectedBpmn.value);
    return processName === selectedBpmn.value;
}

function handleSelectedBpmn(processName: string) {
    selectedBpmn.value = processName;
    vscode.updateState({
        currentPrompt: {
            ...vscode.getState().currentPrompt,
            process: processName,
        },
    });
}

function handleSelectedFormat(format: OutputFormat) {
    vscode.updateState({
        currentPrompt: {
            ...vscode.getState().currentPrompt,
            format: format,
        },
    });
}
</script>

<template>
    <vscode-dropdown v-if="processDropdown?.length > 0">
        <vscode-option
            v-for="processName in processDropdown"
            :key="processName"
            :selected="isBpmnSelected(processName)"
            @click="handleSelectedBpmn(processName)"
        >
            {{ processName }}
        </vscode-option>
    </vscode-dropdown>
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
    <div v-if="!loading">
        <vscode-button @click="generateDocumentation">Generate</vscode-button>
    </div>
    <div v-else class="loading">
        <LoadingAnimation/>
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

.loading {
    display: grid;
    min-height: inherit;
    align-content: center;
    justify-content: center;
}
</style>
