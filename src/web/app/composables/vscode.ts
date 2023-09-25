import { WebviewApi } from "vscode-webview";
import { MessageType, VscMessage, VscState } from "../../../shared/types";

declare const globalViewType: string;

export interface VsCode {
    getState(): VscState<string> | undefined;

    setState(state: VscState<string>): void;

    updateState(state: VscState<string>): void;

    postMessage(message: VscMessage<string>): void;
}

export class VsCodeImpl implements VsCode {
    private vscode: WebviewApi<VscState<string>>;

    constructor() {
        this.vscode = acquireVsCodeApi();
    }

    public getState(): VscState<string> | undefined {
        return this.vscode.getState();
    }

    public setState(state: VscState<string>) {
        this.vscode.setState(state);
    }

    public updateState(state: VscState<string>) {
        this.setState({
            ...state,
        });
    }

    public postMessage(message: VscMessage<string>) {
        this.vscode.postMessage(message);
    }
}

/**
 * To simplify the development of the webview, we allow it to run in the browser.
 * For this purpose, the functionality of the extension/backend is mocked.
 */
export class VsCodeMock implements VsCode {
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
                            data: mockedInitData,
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

const mockedInitData: string = JSON.stringify({
    categories: [
        {
            name: "General Question",
            prompts: [
                "What is business process modeling, and why is it important for organizations?",
                "What does this process do?",
            ],
        },
        {
            name: "BPMN Help",
            prompts: [
                "How can I represent decision points in a BPMN Diagram?",
                "What's the best way to depict parallel activities in BPMN?",
            ],
        },
    ],
});
