import { WebviewApi } from "vscode-webview";

import {
    BpmnFile,
    BpmnFileQuery,
    Command,
    GetBpmnFilesCommand,
    GetPromptsCommand,
    GetTemplatesCommand,
    LogErrorCommand,
    LogInfoCommand,
    Prompt,
    PromptQuery,
    Query,
    Template,
    TemplateQuery,
} from "../../shared";

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
    getState(stateId?: string): CopilotState;

    setState(state: CopilotState): void;

    // updateState(state: Partial<CopilotState>): void;

    postMessage(message: MessageType): void;
}

// export interface CopilotState {
//     viewState: string;
//     templates: Map<string, Template[]>;
//     bpmnFiles: BpmnFile[];
//     prompts: Map<string, Prompt<boolean>[]>;
//     currentPrompt: Prompt<string>;
//     response: string;
// }

type State = {
    lastViewState: string;
    defaultViewState: DefaultViewState;
    documentationViewState: DocumentationViewState;
};

class CopilotState {
    public templates: Map<string, Template[]>;
    public bpmnFiles: BpmnFile[];
    public prompts: Map<string, Prompt<boolean>[]>;

    constructor(
        templates: Map<string, Template[]>,
        bpmnFiles: BpmnFile[],
        prompts: Map<string, Prompt<boolean>[]>,
    ) {
        this.templates = templates;
        this.bpmnFiles = bpmnFiles;
        this.prompts = prompts;
    }
}

export class DefaultViewState extends CopilotState {
    public currentPrompt: Prompt<string>;
    public aiResponse: string;
    public selectedBpmnFile: BpmnFile;

    constructor(
        templates: Map<string, Template[]>,
        bpmnFiles: BpmnFile[],
        prompts: Map<string, Prompt<boolean>[]>,
        currentPrompt: Prompt<string>,
        aiResponse: string,
        selectedBpmnFile: BpmnFile,
    ) {
        super(templates, bpmnFiles, prompts);
        this.currentPrompt = currentPrompt;
        this.aiResponse = aiResponse;
        this.selectedBpmnFile = selectedBpmnFile;
    }
}

export class DocumentationViewState extends CopilotState {
    public selectedBpmnFile: BpmnFile;
    public selectedTemplate: Template;
    public selectedFormat: string;

    constructor(
        templates: Map<string, Template[]>,
        bpmnFiles: BpmnFile[],
        prompts: Map<string, Prompt<boolean>[]>,
        selectedBpmnFile: BpmnFile,
        selectedTemplate: Template,
        selectedFormat: string,
    ) {
        super(templates, bpmnFiles, prompts);
        this.selectedBpmnFile = selectedBpmnFile;
        this.selectedTemplate = selectedTemplate;
        this.selectedFormat = selectedFormat;
    }
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

    public getState(stateId?: string): CopilotState {
        const state = this.vscode.getState();
        if (!state) {
            throw new MissingStateError();
        }

        if (!stateId) {
            switch (state.lastViewState) {
                case "DocumentationViewState": {
                    return state.documentationViewState;
                }
                default: {
                    return state.defaultViewState;
                }
            }
        } else {
            switch (stateId) {
                case "DocumentationViewState": {
                    return state.documentationViewState;
                }
                default: {
                    return state.defaultViewState;
                }
            }
        }
    }

    public setState(state: CopilotState) {
        const currentState = this.vscode.getState();
        if (state instanceof DefaultViewState) {
            this.vscode.setState({
                ...currentState!,
                defaultViewState: state,
                lastViewState: "DefaultViewState",
            });
        } else if (state instanceof DocumentationViewState) {
            this.vscode.setState({
                ...currentState!,
                documentationViewState: state,
                lastViewState: "DocumentationViewState",
            });
        }
    }

    // public updateState(state: Partial<CopilotState>) {
    //     this.setState({
    //         ...this.getState(),
    //         ...state,
    //     });
    // }

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

    getState(stateId?: string): CopilotState {
        if (!this.state) {
            throw new MissingStateError();
        }

        if (!stateId) {
            switch (this.state.lastViewState) {
                case "DocumentationViewState": {
                    return this.state.documentationViewState;
                }
                default: {
                    return this.state.defaultViewState;
                }
            }
        } else {
            switch (stateId) {
                case "DocumentationViewState": {
                    return this.state.documentationViewState;
                }
                default: {
                    return this.state.defaultViewState;
                }
            }
        }
    }

    async postMessage(message: MessageType): Promise<void> {
        switch (true) {
            case message instanceof GetPromptsCommand: {
                const promptQuery = new PromptQuery(mockedPrompts);
                window.dispatchEvent(
                    new MessageEvent("message", {
                        data: promptQuery,
                    }),
                );
                break;
            }
            case message instanceof GetBpmnFilesCommand: {
                const bpmnFileQuery = new BpmnFileQuery(mockedBpmnFiles);
                window.dispatchEvent(
                    new MessageEvent("message", {
                        data: bpmnFileQuery,
                    }),
                );
                break;
            }
            case message instanceof GetTemplatesCommand: {
                const templatesQuery = new TemplateQuery(mockedTemplates);
                window.dispatchEvent(
                    new MessageEvent("message", {
                        data: templatesQuery,
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

    setState(state: CopilotState): void {
        const currentState = this.state;
        if (state instanceof DefaultViewState) {
            this.state = {
                ...currentState!,
                defaultViewState: state,
                lastViewState: "DefaultViewState",
            };
        } else if (state instanceof DocumentationViewState) {
            this.state = {
                ...currentState!,
                documentationViewState: state,
                lastViewState: "DocumentationViewState",
            };
        }
        console.log("[Log] setState()", this.getState());
    }

    // updateState(state: Partial<CopilotState>): void {
    //     const currentState = this.getState();
    //     let viewState: string;
    //     if (state?.viewState) {
    //         viewState = state.viewState;
    //     } else {
    //         viewState = currentState.viewState;
    //     }
    //     let templates: Map<string, Template[]>;
    //     if (state?.templates) {
    //         templates = state.templates;
    //     } else {
    //         templates = currentState.templates;
    //     }
    //     let bpmnFiles: BpmnFile[];
    //     if (state?.bpmnFiles) {
    //         bpmnFiles = state.bpmnFiles;
    //     } else {
    //         bpmnFiles = currentState.bpmnFiles;
    //     }
    //     let prompts: Map<string, Prompt<boolean>[]>;
    //     if (state?.prompts) {
    //         prompts = state.prompts;
    //     } else {
    //         prompts = currentState.prompts;
    //     }
    //     let currentPrompt: Prompt<string>;
    //     if (state?.currentPrompt) {
    //         currentPrompt = state.currentPrompt;
    //     } else {
    //         currentPrompt = currentState.currentPrompt;
    //     }
    //     let response: string;
    //     if (state?.response) {
    //         response = state.response;
    //     } else {
    //         response = currentState.response;
    //     }

    //     this.state = {
    //         viewState,
    //         templates,
    //         bpmnFiles,
    //         prompts,
    //         currentPrompt,
    //         response,
    //     };

    //     console.log("[Log] updateState()", this.getState());
    // }
}

// Mocked Data
const mockedPrompts = new Map<string, Prompt<boolean>[]>([
    [
        "General Question",
        [
            new Prompt<boolean>(
                "What is business process modeling, and why is it important for organizations?",
            ),
            new Prompt<boolean>("What does this process do?", true),
        ],
    ],
    [
        "BPMN Help",
        [
            new Prompt<boolean>(
                "How can I represent decision points in a BPMN Diagram?",
            ),
            new Prompt<boolean>(
                "What's the best way to depict parallel activities in BPMN?",
            ),
        ],
    ],
]);

const mockedBpmnFiles = [
    new BpmnFile("test1.bpmn", "workspace1", "/full/path/to/workspace1/test1.bpmn"),
    new BpmnFile("test2.bpmn", "workspace2", "/full/path/to/workspace2/test2.bpmn"),
    new BpmnFile("test3.bpmn", "workspace3", "/full/path/to/workspace3/test3.bpmn"),
    new BpmnFile("test4.bpmn", "workspace4", "/full/path/to/workspace4/test4.bpmn"),
];

const mockedTemplates = new Map<string, Template[]>([
    [
        "documentation",
        [
            new Template("/full/path/to/documentation/template1", "template1"),
            new Template("/full/path/to/documentation/template2", "template2"),
        ],
    ],
    [
        "form",
        [
            new Template("/full/path/to/form/template1", "template1"),
            new Template("/full/path/to/form/template2", "template2"),
        ],
    ],
    [
        "custom",
        [
            new Template("/full/path/to/custom/template1", "template1"),
            new Template("/full/path/to/custom/template2", "template2"),
        ],
    ],
]);
