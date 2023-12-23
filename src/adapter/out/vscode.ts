import { workspace } from "vscode";

import { BpmnFile, Prompt } from "../../application/model";
import {
    CreateOrShowWebviewOutPort,
    GetBpmnFilesOutPort,
    GetPromptsOutPort,
    SendAiResponseOutPort,
    SendBpmnFilesOutPort,
    SendPromptsOutPort,
} from "../../application/ports/out";
import { AiResponseQuery, BpmnFileQuery, PromptQuery } from "../../shared";
import { CopilotWebview } from "../webview";

export class WorkspaceAdapter implements GetPromptsOutPort, GetBpmnFilesOutPort {
    async getPrompts(): Promise<Prompt[]> {
        throw new Error("Method not implemented.");
    }

    async getBpmnFiles(): Promise<string[]> {
        const files = await workspace.findFiles("**/*.bpmn");
        return files.map((file) => file.path);
    }
}

export class WebviewAdapter
    implements
        CreateOrShowWebviewOutPort,
        SendPromptsOutPort,
        SendBpmnFilesOutPort,
        SendAiResponseOutPort
{
    constructor(private readonly webview: CopilotWebview) {}

    createOrShowWebview(): boolean {
        this.webview.showOrCreate();
        return true;
    }

    sendPrompts(prompts: Prompt[]): Promise<boolean> {
        const sendPromptQuery = new PromptQuery(prompts);
        return this.webview.postMessage(sendPromptQuery);
    }

    sendBpmnFiles(bpmnFiles: BpmnFile[]): Promise<boolean> {
        const sendBpmnFileQuery = new BpmnFileQuery(bpmnFiles);
        return this.webview.postMessage(sendBpmnFileQuery);
    }

    sendAiResponse(response: string): Promise<boolean> {
        const sendAiResponseQuery = new AiResponseQuery(response);
        return this.webview.postMessage(sendAiResponseQuery);
    }
}
