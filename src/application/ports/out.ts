import { BpmnFile, Prompt } from "../model";

export interface GetPromptsOutPort {
    getPrompts(): Promise<Prompt[]>;
}

export interface GetBpmnFilesOutPort {
    getBpmnFiles(): Promise<BpmnFile[]>;
}

export interface CreateOrShowWebviewOutPort {
    createOrShowWebview(): string;
}

export interface CreateFileOutPort {
    createFile(fileName: string, fileContent: string): Promise<boolean>;
}

export interface GetProcessDocumentationOutPort {
    getProcessDocumentation(prompt: string): string;
}

export interface GetFormOutPort {
    getForm(prompt: string): string;
}

export interface GetAiResponseOutPort {
    sendAiResponse(response: string): string;
}

export interface SendPromptsOutPort {
    sendPrompts(prompts: Prompt[]): Promise<boolean>;
}

export interface SendBpmnFilesOutPort {
    sendBpmnFiles(bpmnFiles: BpmnFile[]): Promise<boolean>;
}

export interface SendAiResponseOutPort {
    sendAiResponse(response: string): Promise<boolean>;
}
