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
    bpmnFiles: BpmnFile[];
    prompts: string;
}

class CopilotState {
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

    static createFrom({ bpmnFiles, prompts }: CopilotStateParams): CopilotState {
        const state = new CopilotState();
        state.bpmnFiles = bpmnFiles;
        state.prompts = new Map<string, DefaultPrompt[]>(JSON.parse(prompts));
        return state;
    }
}

interface DefaultViewStateParams extends CopilotStateParams {
    currentPrompt: string;
    selectedBpmnFile?: BpmnFile;
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

    private _selectedBpmnFile?: BpmnFile;

    get selectedBpmnFile(): BpmnFile | undefined {
        return this._selectedBpmnFile;
    }

    set selectedBpmnFile(selectedBpmnFile: BpmnFile | undefined) {
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
        bpmnFiles,
        prompts,
        currentPrompt,
        selectedBpmnFile,
        aiResponse,
    }: DefaultViewStateParams): DefaultViewState {
        const state = new DefaultViewState();
        state.bpmnFiles = bpmnFiles;
        state.prompts = new Map<string, DefaultPrompt[]>(JSON.parse(prompts));
        state.currentPrompt = currentPrompt;
        state.selectedBpmnFile = selectedBpmnFile;
        state.aiResponse = aiResponse;
        return state;
    }

    serialize(): DefaultViewStateParams {
        return {
            bpmnFiles: this.bpmnFiles,
            prompts: JSON.stringify(Array.from(this.prompts.entries())),
            currentPrompt: this.currentPrompt,
            selectedBpmnFile: this.selectedBpmnFile,
            aiResponse: this.aiResponse,
        };
    }
}
