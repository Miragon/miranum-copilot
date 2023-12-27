import {
    BpmnFile,
    DocumentationExtension,
    FormExtension,
    PromptCreation,
    Template,
} from "../model";

export interface CreateOrShowWebviewInPort {
    createOrShowWebview(): string;

    sendTemplates(): Promise<boolean>;

    sendPrompts(): Promise<boolean>;

    sendBpmnFiles(): Promise<boolean>;
}

export interface UpdatePromptsInPort {
    updatePrompts(): void;
}

export interface UpdateBpmnFilesInPort {
    updateBpmnFiles(): void;
}

export interface CreateProcessDocumentationInPort {
    createProcessDocumentation(
        fileName: string,
        bpmnFile: BpmnFile,
        template: Template,
        fileFormat: DocumentationExtension,
    ): Promise<boolean>;
}

export interface CreateFormInPort {
    createForm(
        fileName: string,
        prompt: PromptCreation,
        template: Template,
        fileFormat: FormExtension,
    ): Promise<boolean>;
}

export interface SendAiResponseInPort {
    sendAiResponse(prompt: PromptCreation): Promise<boolean>;
}
