<script lang="ts" setup>
import {computed} from "vue";
import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeDropdown,
    vsCodeOption,
    vsCodeTextArea,
} from "@vscode/webview-ui-toolkit";

import {getVsCode, VsCode} from "@/composables";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

provideVSCodeDesignSystem().register(
    vsCodeButton(),
    vsCodeDropdown(),
    vsCodeOption(),
    vsCodeTextArea(),
);

interface Props {
    loading: boolean;
    inputText: string;
    outputText: string;
    selectedBpmn: string;
    processDropdown: string[];
}

const vscode: VsCode = getVsCode();
const emits = defineEmits(["sendPrompt", "updateSelectedBpmn"]);
const props = defineProps<Props>();

let inputText = computed(() => props.inputText);
let outputText = computed(() => props.outputText);
let selectedBpmn = computed({
    get() {
        return props.selectedBpmn;
    },
    set(processName: string) {
        return processName;
    },
});
let processDropdown = computed(() => props.processDropdown);

let loading = computed(() => props.loading);

function isBpmnSelected(processName: string) {
    return processName === selectedBpmn.value;
}

function updatePrompt() {
    vscode.updateState({currentPrompt: {text: inputText.value}});
}

function sendPrompt() {
    emits("sendPrompt");
}

function handleSelectedBpmn(bpmnName: string) {
    // selectedBpmn.value = bpmnName;
    vscode.updateState({
        currentPrompt: {
            ...vscode.getState().currentPrompt,
            process: bpmnName,
        },
    });

    emits("updateSelectedBpmn", bpmnName);
}
</script>

<template>
    <div class="input">
        <vscode-text-area
            id="inputText"
            v-model="inputText"
            cols="40"
            maxlength="1000"
            placeholder="Enter your prompt here"
            resize="vertical"
            rows="10"
            @input="updatePrompt"
        >
            Your question:
        </vscode-text-area>
        <vscode-dropdown v-if="processDropdown?.length > 0">
            <vscode-option
                v-for="processName in processDropdown"
                :key="processName"
                :selected="isBpmnSelected"
                @click="handleSelectedBpmn(processName)"
            >
                {{ processName }}
            </vscode-option>
        </vscode-dropdown>
        <vscode-button
            id="submitButton"
            appearance="primary"
            aria-label="Send Request"
            @click="sendPrompt"
        >
            Send Prompt
        </vscode-button>
    </div>

    <div class="output">
        <div v-if="loading" class="output-loading">
            <LoadingAnimation/>
        </div>

        <div v-if="!loading" class="output-loaded">
            <vscode-text-area
                id="outputText"
                v-model="outputText"
                cols="60"
                placeholder="Your answer will be printed here"
                readonly
                rows="15"
            >
                Response from ChatGPT
            </vscode-text-area>
        </div>
    </div>
</template>

<style scoped>
vscode-text-area {
    min-height: inherit;
    width: 100%;
    margin-bottom: var(--margin);
    padding: 10px;
    border-radius: 4px;
    border: 1px solid var(--vscode-dropdown-background);
}

vscode-button {
    width: 100%;
    padding: 10px;
    transition: background-color 0.3s ease;
}

.input {
    grid-area: input;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.output {
    grid-area: output;
    min-height: 400px;
}

.output-loading {
    display: grid;
    min-height: inherit;
    align-content: center;
    justify-content: center;
}

.output-loaded {
    min-height: inherit;
}
</style>
