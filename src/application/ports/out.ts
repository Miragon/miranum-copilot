import { BpmnFile, DefaultPrompt, PromptCreation, Template } from "../model";

// FIXME: No dependency to shared

export interface ReadFileOutPort {
    readFile(path: string): Promise<string>;
}

export interface GetPromptsOutPort {
    getPrompts(): Promise<DefaultPrompt[]>;
}

export interface GetBpmnFilesOutPort {
    getBpmnFiles(): Promise<BpmnFile[]>;
}

export interface GetTemplatesOutPort {
    getTemplates(): Promise<Map<string, Template[]>>;
}

export interface CreateOrShowWebviewOutPort {
    createOrShowWebview(): string;
}

export interface CreateFileOutPort {
    createFile(fileName: string, fileContent: string): Promise<boolean>;
}

export interface PostMessageOutPort {
    sendBpmnFiles(bpmnFiles: BpmnFile[]): Promise<boolean>;

    sendPrompts(prompts: DefaultPrompt[]): Promise<boolean>;

    sendTemplates(templates: Map<string, Template[]>): Promise<boolean>;
}

export interface GetAiResponseOutPort {
    getAiResponse(prompt: PromptCreation): Promise<string>;

    getProcessDocumentation(prompt: PromptCreation, fileFormat: string): Promise<string>;

    getForm(prompt: PromptCreation): Promise<string>;
}
