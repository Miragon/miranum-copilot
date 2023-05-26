import { MessageType, VscMessage } from "../../shared/types";
import { StateController } from "@/StateController";
import { initialize, initialized } from "@/utils";

declare const globalViewType: string;
const stateController = new StateController();

const app = document.getElementById("app");

// Referenzen to HTML-elements
const inputText = document.getElementById("inputText")! as HTMLInputElement;
const outputText = document.getElementById("outputText")! as HTMLInputElement;
const submitButton = document.getElementById("submitButton")! as HTMLInputElement;
//check if
if (!inputText || !outputText || !submitButton) {
    throw new Error("Required element not found");
}

/**
 * A function to send a message to the ChatGPT API and view the response.
 */
async function sendMessageToGpt() {
    if (!inputText.value) {
        return;
    }

    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            ["Content-Type"]: "application/json",
        },
        body: JSON.stringify({ inputText: inputText.value }),
    });

    const data = await response.json();

    outputText.value = data.message;
}

// click event listner to button
submitButton.addEventListener("click", sendMessageToGpt);

/**
 * Send a message to the backend.
 * @param type Type of the message
 * @param data (optional) The data of the message
 * @param info (optional) Information that will be logged
 */
function postMessage(type: MessageType, data?: JSON, info?: string): void {
    switch (type) {
        case MessageType.msgFromWebview: {
            stateController.postMessage({
                type: `${globalViewType}.${type}`,
                data: JSON.parse(JSON.stringify(data)),
            });
            break;
        }
        default: {
            stateController.postMessage({
                type: `${globalViewType}.${type}`,
                info: info,
            });
            break;
        }
    }
}

/**
 * Handle incoming messages.
 * @param message The incoming message
 */
function receiveMessage(message: MessageEvent<VscMessage<JSON>>): void {
    try {
        const type = message.data.type;
        const data = message.data.data;

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
                // do something ...
                break;
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        postMessage(MessageType.error, undefined, message);
    }
}

/**
 * Do something with the data
 * @param data
 */
function update(data: JSON) {
    // update state
    stateController.updateState({ data });

    // do something ...
    if (app) {
        app.innerText = JSON.stringify(data, undefined, 4);
    }
}

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
                update(newData);
            }
        } else {
            postMessage(
                MessageType.initialize,
                undefined,
                "Webview was loaded successfully."
            );
            const data = await initialized(); // await the response form the backend
            if (data) {
                update(data);
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        postMessage(MessageType.error, undefined, message);
    }

    postMessage(MessageType.info, undefined, "Webview was initialized.");
};

window.addEventListener("message", receiveMessage);
