export enum MessageType {
    initialize = "initialize",
    restore = "restore",
    msgFromExtension = "msgFromExtension",
    msgFromWebview = "msgFromWebview",
    info = "info",
    error = "error",
}

export interface VscMessage<T> {
    type: string;
    data?: T;
    logger?: string;
}

export interface CopilotMessageData {
    prompts?: string;
    bpmnFiles?: string[];
    response?: string;
}

export interface Prompt {
    text: string;
    process?: boolean | string;
    form?: boolean;
}

export interface DocumentationPrompt {
    template: string;
    format: OutputFormat;
}

export enum OutputFormat {
    json = "JSON",
    md = "Markdown",
}
