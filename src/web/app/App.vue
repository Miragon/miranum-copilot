<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";

import {
    CopilotMessageData,
    isInstanceOfPrompt,
    MessageType,
    Prompt,
    VscMessage,
} from "../../shared";
import {
    createResolver,
    createVsCode,
    MissingStateError,
    TemplatePrompts,
    VsCode,
} from "@/composables";

import SidebarMenu from "./components/SidebarMenu.vue";
import DefaultView from "@/views/DefaultView.vue";
import DocumentationView from "@/views/DocumentationView.vue";

import "./css/style.css";

//
// Vars
//
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const process: { env: { NODE_ENV: string } };
declare const globalViewType: string;

let vscode: VsCode;
if (process.env.NODE_ENV === "development") {
    vscode = createVsCode("development");
} else {
    vscode = createVsCode("production");
}

let inputText = ref("");
let outputText = ref("");
let processDropdown = ref<string[]>([]);

const sidebarMenuKey = ref(0);
const prompts = ref<TemplatePrompts>({ categories: [] });
const bpmnFiles = ref<string[]>([]);

const viewState = ref("DefaultView");
const loading = ref(true);
let shrunk = ref(false);

//
// Logic
//

const resolver = createResolver<CopilotMessageData>();

/**
 * The "main" method.
 * We wait until the webview is fully loaded.
 * Then we send a message to the backend to inform that it is fully loaded.
 * The backend will send then the initial data.
 */
onBeforeMount(async () => {
    // Add event listener for incoming messages
    window.addEventListener("message", receiveMessage);

    try {
        const state = vscode.getState(); // Throws MissingStateError if no state is available
        postMessage(MessageType.restore, undefined, "State was restored successfully.");

        // We will only get data if the user made changes while the webview was in background.
        const data = await resolver.wait();

        let restoredPrompts: TemplatePrompts = { categories: [] };
        let isPromptsChanged = false;
        let restoredBpmnFiles: string[] = [];
        let isBpmnFilesChanged = false;
        if (data) {
            if (data.prompts) {
                restoredPrompts = JSON.parse(data.prompts);
                isPromptsChanged = true;
                prompts.value = restoredPrompts;
                vscode.updateState({
                    prompts: restoredPrompts,
                });
            }
            if (data.bpmnFiles) {
                restoredBpmnFiles = data.bpmnFiles;
                isBpmnFilesChanged = true;
                bpmnFiles.value = restoredBpmnFiles;
                vscode.updateState({
                    bpmnFiles: restoredBpmnFiles,
                });
            }
        }

        if (isInstanceOfPrompt(state.currentPrompt)) {
            inputText.value = state.currentPrompt?.text ? state.currentPrompt.text : "";
            outputText.value = state.response ? state.response : "";
            if (typeof state.currentPrompt?.process === "string") {
                processDropdown.value = isBpmnFilesChanged
                    ? restoredBpmnFiles
                    : state.bpmnFiles;
            }
        }

        prompts.value = isPromptsChanged ? restoredPrompts : state.prompts;
        bpmnFiles.value = isBpmnFilesChanged ? restoredBpmnFiles : state.bpmnFiles;

        loading.value = false;
        sidebarMenuKey.value++;
    } catch (error) {
        if (error instanceof MissingStateError) {
            postMessage(
                MessageType.initialize,
                undefined,
                "Webview was loaded successfully.",
            );
            const data = await resolver.wait();

            if (data) {
                const initPrompts: TemplatePrompts = data.prompts
                    ? JSON.parse(data.prompts)
                    : { categories: [] };
                const initBpmnFiles: string[] = data.bpmnFiles ? data.bpmnFiles : [];
                prompts.value = initPrompts;
                bpmnFiles.value = initBpmnFiles;
                sidebarMenuKey.value++;

                vscode.setState({
                    viewState: "DefaultView",
                    prompts: initPrompts,
                    bpmnFiles: initBpmnFiles,
                    currentPrompt: {},
                    response: "",
                });
            }

            postMessage(MessageType.info, undefined, "Webview was initialized.");
        } else {
            const message = error instanceof Error ? error.message : `${error}`;
            postMessage(MessageType.error, undefined, message);
        }
    }
});

/**
 * Send a message to the backend.
 * @param type Type of the message
 * @param data (optional) The data of the message
 * @param info (optional) Information that will be logged
 */
function postMessage(type: MessageType, data?: string, info?: string): void {
    switch (type) {
        case MessageType.msgFromWebview: {
            loading.value = true;
            vscode.postMessage({
                type: `${globalViewType}.${type}`,
                data: data ? data : "",
            });
            break;
        }
        default: {
            vscode.postMessage({
                type: `${globalViewType}.${type}`,
                logger: info,
            });
            break;
        }
    }
}

/**
 * Handle incoming messages.
 * @param message The incoming message
 */
function receiveMessage(message: MessageEvent<VscMessage<CopilotMessageData>>): void {
    try {
        const type = message.data.type;
        const data = message.data.data;

        switch (type) {
            case `${globalViewType}.${MessageType.initialize}`: {
                loading.value = false;
                resolver.done(data);
                break;
            }
            case `${globalViewType}.${MessageType.restore}`: {
                resolver.done(data);
                break;
            }
            case `${globalViewType}.${MessageType.msgFromExtension}`: {
                loading.value = false;
                if (data?.response) {
                    if (isInstanceOfPrompt(vscode.getState().currentPrompt)) {
                        outputText.value = data.response;
                        vscode.updateState({ response: data.response });
                    }
                }
                if (data?.prompts) {
                    const receivedPrompts: TemplatePrompts = JSON.parse(data.prompts);
                    prompts.value = receivedPrompts;
                    sidebarMenuKey.value++;
                    vscode.updateState({ prompts: receivedPrompts });
                }
                if (data?.bpmnFiles) {
                    const currentPrompt = vscode.getState().currentPrompt;
                    const receivedBpmnFiles: string[] = data.bpmnFiles;
                    bpmnFiles.value = receivedBpmnFiles;
                    if (
                        isInstanceOfPrompt(currentPrompt) &&
                        typeof currentPrompt.process === "string"
                    ) {
                        processDropdown.value = receivedBpmnFiles;
                    }
                    vscode.updateState({ bpmnFiles: receivedBpmnFiles });
                }
                break;
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        postMessage(MessageType.error, undefined, message);
    }
}

function handleSidebarToggle(isVisible: boolean) {
    shrunk.value = isVisible;
}

function handleSelectedPrompt(prompt: Prompt) {
    viewState.value = "DefaultView";
    inputText.value = prompt.text;
    if (prompt.process as boolean) {
        processDropdown.value = bpmnFiles.value;
    } else {
        processDropdown.value = [];
    }
    vscode.updateState({
        viewState: "DefaultView",
        currentPrompt: {
            text: prompt.text,
            process: (prompt.process as boolean) ? bpmnFiles.value[0] : undefined,
        },
    });
}

function handleSelectedDocumentation() {
    viewState.value = "DocumentationView";
    vscode.updateState({ viewState: "DocumentationView" });
}

// function handleSelectedBpmn(bpmnName: string) {
//     vscode.updateState({
//         currentPrompt: {
//             process: bpmnName,
//         },
//     });
// }
//
// function updatePrompt() {
//     vscode.updateState({ currentPrompt: { text: inputText.value } });
// }

function sendPrompt() {
    const currentPrompt = vscode.getState().currentPrompt;
    if (currentPrompt) {
        postMessage(MessageType.msgFromWebview, JSON.stringify(currentPrompt));
    }
}
</script>

<template>
    <main :class="{ shrunk: shrunk }">
        <DefaultView
            v-if="viewState === 'DefaultView'"
            :input-text="inputText"
            :loading="loading"
            :process-dropdown="processDropdown"
            @send-prompt="sendPrompt"
        />
        <DocumentationView
            v-if="viewState === 'DocumentationView'"
            :loading="loading"
            @send-prompt="sendPrompt"
        />
        <!--<div class="input">
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
                <span class="loader"></span>
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
        </div>-->
    </main>
    <SidebarMenu
        :key="sidebarMenuKey"
        :prompts="prompts"
        @sidebar-toggled="handleSidebarToggle"
        @prompt-selected="handleSelectedPrompt"
        @documentation-selected="handleSelectedDocumentation"
    />
</template>

<style scoped>
main {
    display: grid;
    grid-template-areas:
        "input"
        "output";
    gap: 40px;

    width: 800px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>