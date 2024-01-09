import { BpmnFile, DefaultPrompt, PromptCreation, Template } from "../model";

export interface CreateOrShowUiInPort {
    createOrShowWebview(): string;
}

export interface GetBpmnFilesInPort {
    getBpmnFiles(): Promise<BpmnFile[]>;
}

export interface GetPromptsInPort {
    getPrompts(): Promise<Map<string, DefaultPrompt[]>>;
}

export interface GetTemplatesInPort {
    getTemplates(): Promise<Map<string, Template[]>>;
}

export interface SendToUiInPort {
    sendPrompts(prompts: Map<string, DefaultPrompt[]>): Promise<boolean>;

    sendBpmnFiles(bpmnFiles: BpmnFile[]): Promise<boolean>;
}

export interface CreateProcessDocumentationInPort {
    createProcessDocumentation(
        bpmnFiles: BpmnFile[],
        templates: Template[],
    ): Promise<boolean>;
}

export interface CreateFormInPort {
    createForm(templates: Template[]): Promise<boolean>;
}

export interface SendAiResponseInPort {
    sendAiResponse(prompt: PromptCreation, bpmnFile?: BpmnFile): Promise<boolean>;
}
