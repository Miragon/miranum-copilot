import {
    CreateFormCommand,
    CreateProcessDocumentationCommand,
    GetAiResponseCommand,
} from "../../shared";

export interface CreateOrShowWebviewInPort {
    createOrShowWebview(): string;

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
        createProcessDocumentationCommand: CreateProcessDocumentationCommand,
    ): Promise<boolean>;
}

export interface CreateFormInPort {
    createForm(createFormCommand: CreateFormCommand): void;
}

export interface SendAiResponseInPort {
    sendAiResponse(getAiResponseCommand: GetAiResponseCommand): void;
}
