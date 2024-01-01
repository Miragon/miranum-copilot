import { BpmnFile, DefaultPrompt } from "../../shared";

export interface State {
    defaultViewState: DefaultViewStateParams;
}

export type ConcreteState = DefaultViewState;

let state: ConcreteState | undefined;

export function getGlobalState(): ConcreteState {
    if (!state) {
        throw new Error("State is missing.");
    }

    return state;
}

export function setGlobalState(newState: ConcreteState): void {
    state = newState;
}

interface CopilotStateParams {
    // templates: Map<string, Template[]>;
    bpmnFiles: BpmnFile[];
    prompts: Map<string, DefaultPrompt[]>;
}

class CopilotState {
    // private _templates = new Map<string, Template[]>();

    // get templates(): Map<string, Template[]> {
    //     return this._templates;
    // }

    // set templates(templates: Map<string, Template[]>) {
    //     this._templates = templates;
    // }

    private _bpmnFiles: BpmnFile[] = [];

    get bpmnFiles(): BpmnFile[] {
        return this._bpmnFiles;
    }

    set bpmnFiles(bpmnFiles: BpmnFile[]) {
        this._bpmnFiles = bpmnFiles;
    }

    private _prompts = new Map<string, DefaultPrompt[]>();

    get prompts(): Map<string, DefaultPrompt[]> {
        return this._prompts;
    }

    set prompts(prompts: Map<string, DefaultPrompt[]>) {
        this._prompts = prompts;
    }

    static createFrom({
        //templates,
        bpmnFiles,
        prompts,
    }: CopilotStateParams): CopilotState {
        const state = new CopilotState();
        // state.templates = templates;
        state.bpmnFiles = bpmnFiles;
        state.prompts = prompts;
        return state;
    }
}

interface DefaultViewStateParams extends CopilotStateParams {
    currentPrompt: string;
    selectedBpmnFile: BpmnFile;
    aiResponse: string;
}

export class DefaultViewState extends CopilotState {
    private _currentPrompt = "";

    get currentPrompt(): string {
        return this._currentPrompt;
    }

    set currentPrompt(currentPrompt: string) {
        this._currentPrompt = currentPrompt;
    }

    private _selectedBpmnFile = new BpmnFile("", "", "");

    get selectedBpmnFile(): BpmnFile {
        return this._selectedBpmnFile;
    }

    set selectedBpmnFile(selectedBpmnFile: BpmnFile) {
        this._selectedBpmnFile = selectedBpmnFile;
    }

    private _aiResponse: string = "";

    get aiResponse(): string {
        return this._aiResponse;
    }

    set aiResponse(aiResponse: string) {
        this._aiResponse = aiResponse;
    }

    static createFrom({
        // templates,
        bpmnFiles,
        prompts,
        currentPrompt,
        selectedBpmnFile,
        aiResponse,
    }: DefaultViewStateParams): DefaultViewState {
        const state = new DefaultViewState();
        // state.templates = templates;
        state.bpmnFiles = bpmnFiles;
        state.prompts = prompts;
        state.currentPrompt = currentPrompt;
        state.selectedBpmnFile = selectedBpmnFile;
        state.aiResponse = aiResponse;
        return state;
    }
}
