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

export interface VscState<T> {
    data?: T;
}

export interface CopilotMessageData {
    prompts?: string;
    response?: string;
}
