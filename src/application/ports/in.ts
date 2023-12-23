export interface CreateOrShowWebviewInPort {
    createOrShowWebview(): void;

    sendPrompts(): void;

    sendBpmnFiles(): void;
}

export interface UpdatePromptsInPort {
    updatePrompts(): void;
}

export interface UpdateBpmnFilesInPort {
    updateBpmnFiles(): void;
}

export interface CreateProcessDocumentationInPort {
    createProcessDocumentation(): void;
}

export interface CreateFormInPort {
    createForm(): void;
}

export interface SendAiResponseInPort {
    sendAiResponse(): void;
}
