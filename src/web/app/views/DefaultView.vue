<script lang="ts" setup>
import { computed } from "vue";
import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeDropdown,
    vsCodeOption,
    vsCodeTextArea,
} from "@vscode/webview-ui-toolkit";

import { getVsCodeApi, VsCode } from "@/vscode";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { BpmnFile, GetAiResponseCommand } from "../../../shared";
import { getGlobalState } from "@/state";

provideVSCodeDesignSystem().register(
    vsCodeButton(),
    vsCodeDropdown(),
    vsCodeOption(),
    vsCodeTextArea(),
);

interface Props {
    loading: boolean;
    prompt: string;
    aiResponse: string;
    selectedBpmn: BpmnFile | undefined;
    bpmnFiles: BpmnFile[];
}

const vscode: VsCode = getVsCodeApi();
const emits = defineEmits(["updateSelectedBpmn"]);
const props = defineProps<Props>();

let prompt = computed(() => props.prompt);
let aiResponse = computed(() => props.aiResponse);
let selectedBpmn = computed({
    get() {
        return props.selectedBpmn;
    },
    set(bpmnFile?: BpmnFile) {
        return bpmnFile;
    },
});
let bpmnFiles = computed(() => props.bpmnFiles);

let loading = computed(() => props.loading);

function selectBpmn(element: HTMLOptionElement, bpmnFile: BpmnFile) {
    if (bpmnFile.fullPath === selectedBpmn.value?.fullPath) {
        element.setAttribute("selected", "selected");
    }
}

function updatePrompt() {
    const state = getGlobalState();
    state.currentPrompt = prompt.value;
    vscode.setState(state);
}

function updateSelectedBpmn(bpmnFile: BpmnFile) {
    selectedBpmn.value = bpmnFile;
    const state = getGlobalState();
    state.selectedBpmnFile = bpmnFile;
    vscode.setState(state);

    emits("updateSelectedBpmn", bpmnFile);
}

function sendPrompt() {
    const state = getGlobalState();
    const getAiResponse = new GetAiResponseCommand(
        state.currentPrompt,
        state.selectedBpmnFile,
    );
    vscode.postMessage(getAiResponse);
}
</script>

<template>
    <div class="input">
        <vscode-text-area
            id="inputText"
            v-model="prompt"
            cols="40"
            maxlength="1000"
            placeholder="Enter your prompt here"
            resize="vertical"
            rows="10"
            @input="updatePrompt"
        >
            Your question:
        </vscode-text-area>
        <vscode-dropdown v-if="bpmnFiles?.length > 0">
            <vscode-option
                v-for="bpmnFile in bpmnFiles"
                :key="bpmnFile"
                :ref="(el: HTMLOptionElement) => selectBpmn(el, bpmnFile)"
                @click="updateSelectedBpmn(bpmnFile)"
            >
                <div class="bpmn-file">
                    <span class="workspace">{{ bpmnFile.workspaceName }}:</span>
                    <span class="file">{{ bpmnFile.fileName }}</span>
                </div>
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
            <LoadingAnimation />
        </div>

        <div v-if="!loading" class="output-loaded">
            <vscode-text-area
                id="outputText"
                v-model="aiResponse"
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

.bpmn-file {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.workspace {
    color: darkgray;
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
