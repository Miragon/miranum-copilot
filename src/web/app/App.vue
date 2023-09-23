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
                resolver.done(data);
                break;
            }
            case `${globalViewType}.${MessageType.restore}`: {
                resolver.done(data);
                break;
            }
            case `${globalViewType}.${MessageType.msgFromExtension}`: {
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
        <div class="input-container">
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
                @click="postMessage(MessageType.msgFromWebview, inputText)"
            >
                Send Prompt
            </vscode-button>
        </div>
        <div class="output-container">
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
    </main>
    <Sidebar :key="key" :prompts="prompts" @sidebarToggled="handleSidebarToggle" />
</template>