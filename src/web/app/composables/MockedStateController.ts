import { VsCode } from "@/composables/types";
import { MessageType, VscMessage, VscState } from "../../../shared/types";

declare const globalViewType: string;

/**
 * To simplify the development of the webview, we allow it to run in the browser.
 * For this purpose, the functionality of the extension/backend is mocked.
 */
export class MockedStateController implements VsCode {
    getState(): VscState<string> | undefined {
        return undefined;
    }

    async postMessage(message: VscMessage<string>): Promise<void> {
        const { type, data, logger } = message;
        switch (type) {
            case `${globalViewType}.${MessageType.initialize}`: {
                console.log("[Log]", logger);
                window.dispatchEvent(
                    new MessageEvent("message", {
                        data: {
                            type: `${globalViewType}.${MessageType.initialize}`,
                        },
                    }),
                );
                break;
            }
            case `${globalViewType}.${MessageType.msgFromWebview}`: {
                // We use a Postman Mock Server to mock the OpenAI API Call.
                // The server simulates a fixed network delay of 1000 seconds.
                const url: string =
                    "https://c3f762bd-e999-47ca-b3bf-1e723bd4ec76.mock.pstmn.io/createChatCompletion";
                const res = await fetch(url);
                const json = await res.json();
                window.dispatchEvent(
                    new MessageEvent("message", {
                        data: {
                            type: `${globalViewType}.${MessageType.msgFromExtension}`,
                            data: json.data,
                        },
                    }),
                );
                break;
            }
            case `${globalViewType}.${MessageType.error}`: {
                console.error("[Log]", logger);
                break;
            }
            case `${globalViewType}.${MessageType.info}`: {
                console.log("[Log]", logger);
                break;
            }
        }
    }

    setState(state: VscState<string>): void {
        console.log("[Log] setState()", state);
    }

    updateState(state: VscState<string>): void {
        console.log("[Log] updateState()", state);
    }
}
