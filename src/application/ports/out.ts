import { BpmnFile, Prompt, PromptCreation } from "../model";
// FIXME: No dependency to shared
import { MiranumCopilotCommand, MiranumCopilotQuery, Template } from "../../shared";

export interface ReadFileOutPort {
    readFile(path: string): Promise<string>;
}

export interface GetPromptsOutPort {
    getPrompts(): Promise<Prompt[]>;
}

export interface GetBpmnFilesOutPort {
    getBpmnFiles(): Promise<BpmnFile[]>;
}

export interface GetTemplatesOutPort {
    getTemplates(): Promise<Template[]>;
}

export interface CreateOrShowWebviewOutPort {
    createOrShowWebview(): string;
}

export interface CreateFileOutPort {
    createFile(fileName: string, fileContent: string): Promise<boolean>;
}

export interface PostMessageOutPort {
    postMessage(message: MiranumCopilotCommand | MiranumCopilotQuery): Promise<boolean>;
}

export interface GetAiResponseOutPort {
    getAiResponse(prompt: PromptCreation): Promise<string>;

    getProcessDocumentation(prompt: PromptCreation, fileFormat: string): Promise<string>;

    getForm(prompt: PromptCreation): Promise<string>;
}
