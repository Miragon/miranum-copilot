import { WebviewApi } from "vscode-webview";

import { MessageType, Prompt, VscMessage } from "../../../shared/types";
import { TemplatePrompts } from "@/composables/types";

declare const globalViewType: string;

export interface VsCode {
    getState(): CopilotState | undefined;

    setState(state: Partial<CopilotState>): void;

    updateState(state: Partial<CopilotState>): void;

    postMessage(message: VscMessage<string>): void;
}

interface CopilotState {
    prompts: TemplatePrompts;
    bpmnFiles: string[];
    currentPrompt: Prompt;
    response: string;
}

export class VsCodeImpl implements VsCode {
    private vscode: WebviewApi<CopilotState>;

    constructor() {
        this.vscode = acquireVsCodeApi();
    }

    public getState(): CopilotState | undefined {
        return this.vscode.getState();
    }

    public setState(state: Partial<CopilotState>) {
        this.vscode.setState({
            prompts: state.prompts ? state.prompts : { categories: [] },
            bpmnFiles: state.bpmnFiles ? state.bpmnFiles : [],
            currentPrompt: state.currentPrompt ? state.currentPrompt : { text: "" },
            response: state.response ? state.response : "",
        });
    }

    public updateState(state: Partial<CopilotState>) {
        this.setState({
            ...this.getState(),
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
    private state: CopilotState | undefined;

    getState(): CopilotState | undefined {
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
                                bpmnFiles: ["file1.bpmn", "file2.bpmn"],
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

    setState(state: CopilotState): void {
        this.state = state;
        console.log("[Log] setState()", this.getState());
    }

    updateState(state: Partial<CopilotState>): void {
        const currentState = this.getState();
        let prompts: TemplatePrompts = { categories: [] };
        if (currentState?.prompts) {
            prompts = currentState.prompts;
        } else if (state?.prompts) {
            prompts = state.prompts;
        }
        let bpmnFiles: string[] = [];
        if (currentState?.bpmnFiles) {
            bpmnFiles = currentState.bpmnFiles;
        } else if (state?.bpmnFiles) {
            bpmnFiles = state.bpmnFiles;
        }
        let currentPrompt: Prompt = { text: "" };
        if (currentState?.currentPrompt) {
            currentPrompt = currentState.currentPrompt;
        } else if (state?.currentPrompt) {
            currentPrompt = state.currentPrompt;
        }
        let response: string = "";
        if (currentState?.response) {
            response = currentState.response;
        } else if (state?.response) {
            response = state.response;
        }

        this.state = {
            prompts,
            bpmnFiles,
            currentPrompt,
            response,
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
                    text: "What is business process modeling, and why is it important for organizations?",
                },
                {
                    text: "What does this process do?",
                    process: true,
                },
            ],
        },
        {
            name: "BPMN Help",
            prompts: [
                {
                    text: "How can I represent decision points in a BPMN Diagram?",
                },
                {
                    text: "What's the best way to depict parallel activities in BPMN?",
                },
            ],
        },
    ],
};
