import { WebviewApi } from "vscode-webview";

import { MessageType, Prompt, VscMessage } from "../../../shared/types";
import { TemplatePrompts } from "@/composables/types";

declare const globalViewType: string;

export interface VsCode {
    getState(): CopilotState;

    setState(state: CopilotState): void;

    updateState(state: Partial<CopilotState>): void;

    postMessage(message: VscMessage<string>): void;
}

export class MissingStateError extends Error {
    constructor() {
        super("State is missing.");
    }
}

interface CopilotState {
    prompts: TemplatePrompts;
    bpmnFiles: string[];
    currentPrompt: Partial<Prompt>;
    response: string;
}

export class VsCodeImpl implements VsCode {
    private vscode: WebviewApi<CopilotState>;

    constructor() {
        this.vscode = acquireVsCodeApi();
    }

    public getState(): CopilotState {
        const state = this.vscode.getState();
        if (!state) {
            throw new MissingStateError();
        }

        return state;
    }

    public setState(state: CopilotState) {
        this.vscode.setState({
            prompts: state.prompts,
            bpmnFiles: state.bpmnFiles,
            currentPrompt: state.currentPrompt,
            response: state.response,
        });
        console.log("[Log] setState()", this.getState());
    }

    public updateState(state: Partial<CopilotState>) {
        this.setState({
            ...this.getState(),
            ...state,
            currentPrompt: {
                ...this.getState().currentPrompt,
                ...state.currentPrompt,
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
    private state: CopilotState | undefined;

    getState(): CopilotState {
        if (!this.state) {
            throw new MissingStateError();
        }

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
        if (state?.prompts) {
            prompts = state.prompts;
        } else {
            prompts = currentState.prompts;
        }
        let bpmnFiles: string[] = [];
        if (state?.bpmnFiles) {
            bpmnFiles = state.bpmnFiles;
        } else {
            bpmnFiles = currentState.bpmnFiles;
        }
        let currentPrompt: Partial<Prompt> = {};
        if (state?.currentPrompt) {
            currentPrompt = state.currentPrompt;
        } else {
            currentPrompt = currentState.currentPrompt;
        }
        let response: string = "";
        if (state?.response) {
            response = state.response;
        } else {
            response = currentState.response;
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
