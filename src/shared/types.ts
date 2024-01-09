import { Command, Query } from "./common";

export class DefaultPrompt {
    public readonly prompt: string;

    public readonly process?: boolean;

    public readonly form?: boolean;

    constructor(prompt: string, process?: boolean, form?: boolean) {
        this.prompt = prompt;
        this.process = process;
        this.form = form;
    }
}

export class BpmnFile {
    public readonly fileName: string;

    public readonly workspaceName: string;

    public readonly fullPath: string;

    constructor(fileName: string, workspaceName: string, fullPath: string) {
        this.fileName = fileName;
        this.workspaceName = workspaceName;
        this.fullPath = fullPath;
    }
}

// Commands
export interface MiranumCopilotCommand extends Command {}

export class GetPromptsCommand implements MiranumCopilotCommand {
    public readonly type = "GetPromptsCommand";
}

export class GetBpmnFilesCommand implements MiranumCopilotCommand {
    public readonly type = "GetBpmnFilesCommand";
}

export class GetAiResponseCommand implements MiranumCopilotCommand {
    public readonly type = "GetAiResponseCommand";

    public readonly prompt: string;

    public readonly bpmnFile?: BpmnFile;

    constructor(prompt: string, bpmnFile?: BpmnFile) {
        this.prompt = prompt;
        this.bpmnFile = bpmnFile;
    }
}

// Queries
export interface MiranumCopilotQuery extends Query {}

export class PromptQuery implements MiranumCopilotQuery {
    public readonly type = "PromptQuery";

    public readonly prompts: string;

    constructor(prompts: Map<string, DefaultPrompt[]>) {
        // a map is not serializable, so we have to convert it to a string
        this.prompts = JSON.stringify(Array.from(prompts.entries()));
    }
}

export class BpmnFileQuery implements MiranumCopilotQuery {
    public readonly type = "BpmnFileQuery";

    public readonly bpmnFiles: BpmnFile[];

    constructor(bpmnFiles: BpmnFile[]) {
        this.bpmnFiles = bpmnFiles;
    }
}

export class AiResponseQuery implements MiranumCopilotQuery {
    public readonly type = "AiResponseQuery";

    public readonly response: string;

    constructor(response: string) {
        this.response = response;
    }
}
