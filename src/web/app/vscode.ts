import { WebviewApi } from "vscode-webview";

import {
    AiResponseQuery,
    BpmnFile,
    BpmnFileQuery,
    Command,
    DefaultPrompt,
    GetAiResponseCommand,
    GetBpmnFilesCommand,
    GetPromptsCommand,
    LogErrorCommand,
    LogInfoCommand,
    PromptQuery,
    Query,
} from "../../shared";
import { ConcreteState, DefaultViewState, State } from "./state";

let vscode: VsCode | undefined;

export function initVsCodeApi(env: string): VsCode {
    if (vscode) {
        return vscode;
    }

    if (env === "production") {
        vscode = new VsCodeImpl();
    } else {
        vscode = new VsCodeMock();
    }

    return vscode;
}

export function getVsCodeApi(): VsCode {
    if (!vscode) {
        throw new Error("VsCode not initialized.");
    }

    return vscode;
}

type MessageType = Command | Query;

export interface VsCode {
    getState(stateId: string): ConcreteState;

    setState(state: ConcreteState): void;

    postMessage(message: MessageType): void;
}

export class MissingStateError extends Error {
    constructor() {
        super("State is missing.");
    }
}

class VsCodeImpl implements VsCode {
    private vscode: WebviewApi<State>;

    constructor() {
        this.vscode = acquireVsCodeApi();
    }

    public getState(stateId: string): ConcreteState {
        const state = this.vscode.getState();
        if (!state) {
            throw new MissingStateError();
        }

        switch (stateId) {
            default: {
                return DefaultViewState.createFrom({
                    ...state.defaultViewState,
                });
            }
        }
    }

    public setState(state: ConcreteState) {
        // if there are multiple views with different state ids, we need to check which one has changed
        this.vscode.setState({
            lastViewStateId: "DefaultViewState",
            defaultViewState: state,
        });
    }

    public postMessage(message: MessageType) {
        this.vscode.postMessage(message);
    }
}

/**
 * To simplify the development of the webview, we allow it to run in the browser.
 * For this purpose, the functionality of the extension/backend is mocked.
 */
class VsCodeMock implements VsCode {
    private state: State | undefined;

    getState(stateId: string): ConcreteState {
        if (!this.state) {
            throw new MissingStateError();
        }

        switch (stateId) {
            default: {
                return DefaultViewState.createFrom({
                    ...this.state.defaultViewState,
                });
            }
        }
    }

    public setState(state: ConcreteState) {
        // if there are multiple views with different state ids, we need to check which one has changed
        this.state = {
            defaultViewState: state.serialize(),
        };
        console.debug("[Debug] setState()", this.getState("DefaultViewState"));
    }

    async postMessage(message: MessageType): Promise<void> {
        switch (true) {
            case message instanceof GetPromptsCommand: {
                const promptQuery = new PromptQuery(mockedPrompts);
                console.debug("[Debug] postMessage() GetPromptsCommand", promptQuery);
                window.dispatchEvent(
                    new MessageEvent("message", {
                        data: promptQuery,
                    }),
                );
                break;
            }
            case message instanceof GetBpmnFilesCommand: {
                const bpmnFileQuery = new BpmnFileQuery(mockedBpmnFiles);
                console.debug(
                    "[Debug] postMessage() GetBpmnFilesCommand",
                    bpmnFileQuery,
                );
                window.dispatchEvent(
                    new MessageEvent("message", {
                        data: bpmnFileQuery,
                    }),
                );
                break;
            }
            case message instanceof GetAiResponseCommand: {
                const aiResponseQuery = new AiResponseQuery("The command was executed");
                console.debug(
                    "[Debug] postMessage() GetAiResponseCommand",
                    aiResponseQuery,
                );
                window.dispatchEvent(
                    new MessageEvent("message", {
                        data: aiResponseQuery,
                    }),
                );
                break;
            }
            case message instanceof LogInfoCommand: {
                console.log("[Log]", (message as LogInfoCommand).message);
                break;
            }
            case message instanceof LogErrorCommand: {
                console.error("[Log]", (message as LogInfoCommand).message);
                break;
            }
        }
    }
}

// Mocked Data
const mockedPrompts = new Map<string, DefaultPrompt[]>([
    [
        "General Question",
        [
            new DefaultPrompt(
                "What is business process modeling, and why is it important for organizations?",
            ),
            new DefaultPrompt("What does this process do?", true),
        ],
    ],
    [
        "BPMN Help",
        [
            new DefaultPrompt("How can I represent decision points in a BPMN Diagram?"),
            new DefaultPrompt(
                "What's the best way to depict parallel activities in BPMN?",
            ),
        ],
    ],
]);

const mockedBpmnFiles = [
    new BpmnFile("test1.bpmn", "workspace1", "/full/path/to/workspace1/test1.bpmn"),
    new BpmnFile("test2.bpmn", "workspace2", "/full/path/to/workspace2/test2.bpmn"),
    new BpmnFile("test3.bpmn", "workspace3", "/full/path/to/workspace3/test3.bpmn"),
    new BpmnFile("test4.bpmn", "workspace3", "/full/path/to/workspace3/test4.bpmn"),
];
