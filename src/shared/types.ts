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
    info?: string;
}

export interface VscState<T> {
    data?: T;
}
