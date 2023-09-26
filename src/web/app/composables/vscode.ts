import { WebviewApi } from "vscode-webview";

import { MessageType, VscMessage, VscState } from "../../../shared/types";
import { Prompt, TemplatePrompts } from "@/composables/types";

declare const globalViewType: string;

export interface VsCode {
    getState(): VscState<CopilotState> | undefined;

    setState(state: VscState<CopilotState>): void;

    updateState(state: VscState<CopilotState>): void;

    postMessage(message: VscMessage<string>): void;
}

interface CopilotState {
    prompts?: TemplatePrompts;
    currentPrompt?: Prompt;
    response?: string;
}

export class VsCodeImpl implements VsCode {
    private vscode: WebviewApi<VscState<CopilotState>>;

    constructor() {
        this.vscode = acquireVsCodeApi();
    }

    public getState(): VscState<CopilotState> | undefined {
        return this.vscode.getState();
    }

    public setState(state: VscState<CopilotState>) {
        this.vscode.setState(state);
    }

    public updateState(state: VscState<CopilotState>) {
        this.setState({
            data: {
                ...this.getState()?.data,
                ...state.data,
            },
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
    private state: VscState<CopilotState> | undefined;

    getState(): VscState<CopilotState> | undefined {
        return this.state;
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
                            data: {
                                prompts: JSON.stringify(mockedInitData),
                            },
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

    setState(state: VscState<CopilotState>): void {
        this.state = state;
        console.log("[Log] setState()", this.getState());
    }

    updateState(state: VscState<CopilotState>): void {
        this.state = {
            data: {
                ...this.getState()?.data,
                ...state.data,
            },
        };

        console.log("[Log] updateState()", this.getState());
    }
}

const mockedInitData: TemplatePrompts = {
    categories: [
        {
            name: "General Question",
            prompts: [
                {
                    prompt: "What is business process modeling, and why is it important for organizations?",
                },
                {
                    prompt: "What does this process do?",
                    process: true,
                },
            ],
        },
        {
            name: "BPMN Help",
            prompts: [
                {
                    prompt: "How can I represent decision points in a BPMN Diagram?",
                },
                {
                    prompt: "What's the best way to depict parallel activities in BPMN?",
                },
            ],
        },
    ],
};
