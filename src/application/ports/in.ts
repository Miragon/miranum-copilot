import { DocumentationFormat, FormFormat, PromptCreation, Template } from "../model";

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
        bpmnFilePath: string,
        template: Template,
        fileFormat: DocumentationFormat,
    ): Promise<boolean>;
}

export interface CreateFormInPort {
    createForm(
        fileName: string,
        prompt: PromptCreation,
        template: Template,
        fileFormat: FormFormat,
    ): Promise<boolean>;
}

export interface SendAiResponseInPort {
    sendAiResponse(prompt: PromptCreation): Promise<boolean>;
}
