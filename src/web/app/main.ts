import {MessageType, VscMessage} from "../../shared/types";
import {StateController} from "@/StateController";
import {initialize, initialized} from "@/utils";
import {provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea,} from "@vscode/webview-ui-toolkit";

import "./css/style.css";

provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());

declare const globalViewType: string;

//
// Globals
//
const stateController = new StateController();

//Referenzen to HTML-elements
const inputText = document.getElementById("inputText")! as HTMLInputElement;
const outputText = document.getElementById("outputText")! as HTMLInputElement;
const submitButton = document.getElementById("submitButton")! as HTMLInputElement;

//
// Logic
//
if (!inputText || !outputText || !submitButton) {
    const errMsg = "Required element not found";
    postMessage(MessageType.error, undefined, errMsg);
    throw new Error("Required element not found");
}

// Add event listener for incoming messages
window.addEventListener("message", receiveMessage);

/**
 * The "main" method.
 * We wait until the webview is fully loaded.
 * Then we send a message to the backend to inform that it is fully loaded.
 * The backend will send then the initial data.
 */
window.onload = async function () {
    try {
        const state = stateController.getState();
        if (state && state.data) {
            postMessage(
                MessageType.restore,
                undefined,
                "State was restored successfully."
            );
            const newData = await initialized(); // await the response form the backend
            if (newData) {
                stateController.setState({ data: newData });
            }
        } else {
            postMessage(
                MessageType.initialize,
                undefined,
                "Webview was loaded successfully."
            );
            const data = await initialized(); // await the response form the backend
            if (data) {
                stateController.setState({ data });
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        postMessage(MessageType.error, undefined, message);
    }

    postMessage(MessageType.info, undefined, "Webview was initialized.");
};

// click event listener to button
submitButton.addEventListener("click", () => {
    postMessage(MessageType.msgFromWebview, inputText.value);
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
            stateController.postMessage({
                type: `${globalViewType}.${type}`,
                data: data ? data : "",
            });
            break;
        }
        default: {
            stateController.postMessage({
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

        stateController.updateState({ data });

        switch (type) {
            case `${globalViewType}.${MessageType.initialize}`: {
                initialize(data);
                break;
            }
            case `${globalViewType}.${MessageType.restore}`: {
                initialize(data);
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
