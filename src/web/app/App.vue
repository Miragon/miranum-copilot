<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeTextArea,
} from "@vscode/webview-ui-toolkit";
import { MessageType, VscMessage } from "../../shared/types";
import { createResolver, VsCode, VsCodeImpl, VsCodeMock } from "@/composables";

import "./css/style.css";
import Sidebar from "./Sidebar.vue";
import { TemplatePrompts } from "@/composables/types";

// provideVSCodeDesignSystem().register(allComponents);
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());

//
// Globals
//
declare const globalViewType: string;
declare const process: { env: { NODE_ENV: string } };

let vscode: VsCode;
if (process.env.NODE_ENV === "development") {
    vscode = new VsCodeMock();
} else {
    vscode = new VsCodeImpl();
}

const key = ref(0);
const prompts = ref<TemplatePrompts>({ categories: [] });

const loading = ref(true);

let inputText = ref("");
let outputText = ref("");
let shrunk = ref(false);
const handleSidebarToggle = (isVisible: boolean) => {
    shrunk.value = isVisible;
};

function toggleMainContent() {
    shrunk.value = !shrunk.value;
}

//
// Logic
//

const resolver = createResolver();

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
        const state = vscode.getState();
        if (state && state.data) {
            postMessage(
                MessageType.restore,
                undefined,
                "State was restored successfully.",
            );
            const newData = await resolver.wait(); // initialized(); // await the response form the backend
            if (newData) {
                vscode.setState({ data: newData });
            }
        } else {
            postMessage(
                MessageType.initialize,
                undefined,
                "Webview was loaded successfully.",
            );
            const data = await resolver.wait(); // initialized(); // await the response form the backend
            if (data) {
                prompts.value = JSON.parse(data);
                key.value++;
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        postMessage(MessageType.error, undefined, message);
    }

    postMessage(MessageType.info, undefined, "Webview was initialized.");
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
function receiveMessage(message: MessageEvent<VscMessage<string>>): void {
    try {
        const type = message.data.type;
        const data = message.data.data;

        vscode.updateState({ data });

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
                outputText.value = data ? data : "";
                break;
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        postMessage(MessageType.error, undefined, message);
    }
}
</script>

<template>
    <main :class="{ shrunk: shrunk }">
        <div class="input">
            <vscode-text-area
                id="inputText"
                v-model="inputText"
                cols="40"
                maxlength="1000"
                placeholder="Enter your prompt here"
                resize="vertical"
                rows="10"
            >
                Your question:
            </vscode-text-area>
            <vscode-button
                id="submitButton"
                appearance="primary"
                aria-label="Send Request"
                @click="postMessage(MessageType.msgFromWebview, inputText)"
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
        </div>
    </main>
    <Sidebar :key="key" :prompts="prompts" @sidebar-toggled="handleSidebarToggle" />
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

/* Loader Animation*/
.loader {
    display: inline-block;
    position: relative;
    width: 48px;
    height: 40px;
    margin-top: 30px;
    background: var(--vscode-button-background);
    border-radius: 15% 15% 35% 35%;
}

.loader::after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    left: 45px;
    top: 8px;
    border: 4px solid var(--vscode-button-background);
    width: 16px;
    height: 20px;
    border-radius: 0 4px 4px 0;
}

.loader::before {
    content: "";
    position: absolute;
    width: 1px;
    height: 10px;
    color: var(--vscode-editor-foreground);
    top: -15px;
    left: 11px;
    box-sizing: border-box;
    animation: animloader 1s ease infinite;
}

@keyframes animloader {
    0% {
        box-shadow:
            2px 0 rgba(255, 255, 255, 0),
            12px 0 rgba(255, 255, 255, 0.3),
            20px 0 rgba(255, 255, 255, 0);
    }
    50% {
        box-shadow:
            2px -5px rgba(255, 255, 255, 0.5),
            12px -3px rgba(255, 255, 255, 0.5),
            20px -2px rgba(255, 255, 255, 0.6);
    }
    100% {
        box-shadow:
            2px -8px rgba(255, 255, 255, 0),
            12px -5px rgba(255, 255, 255, 0),
            20px -5px rgba(255, 255, 255, 0);
    }
}
</style>