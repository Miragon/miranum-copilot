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
    // sendTemplates(templates: Map<string, Template[]>): Promise<boolean>;

    sendPrompts(prompts: Map<string, DefaultPrompt[]>): Promise<boolean>;

    sendBpmnFiles(bpmnFiles: BpmnFile[]): Promise<boolean>;
}

export interface CreateProcessDocumentationInPort {
    createProcessDocumentation(
        bpmnFiles: BpmnFile[],
        templates: Template[],
    ): Promise<boolean>;

    // createProcessDocumentation(
    //     fileName: string,
    //     bpmnFile: BpmnFile,
    //     template: Template,
    //     fileFormat: DocumentationExtension,
    // ): Promise<boolean>;
}

export interface CreateFormInPort {
    createForm(templates: Template[]): Promise<boolean>;

    // createForm(
    //     fileName: string,
    //     prompt: PromptCreation,
    //     template: Template,
    //     fileFormat: FormExtension,
    // ): Promise<boolean>;
}

export interface SendAiResponseInPort {
    sendAiResponse(prompt: PromptCreation, bpmnFile?: BpmnFile): Promise<boolean>;
}
