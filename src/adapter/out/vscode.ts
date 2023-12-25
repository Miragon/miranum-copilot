import { Uri, workspace } from "vscode";

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
import { EXTENSION_CONTEXT } from "../../utils";

type PromptsSchema = {
    categories: [
        {
            name: string;
            prompts: [
                {
                    text: string;
                    process?: boolean;
                    form?: boolean;
                },
            ];
        },
    ];
};

export class WorkspaceAdapter implements GetPromptsOutPort, GetBpmnFilesOutPort {
    private readonly fs = workspace.fs;

    async getPrompts(): Promise<Prompt[]> {
        const uri = Uri.joinPath(
            EXTENSION_CONTEXT.getContext().extensionUri,
            "resources",
            "prompts",
            "prompts.json",
        );
        const uint8Array = await this.fs.readFile(uri);
        const fileString = Buffer.from(uint8Array).toString();
        const json: PromptsSchema = JSON.parse(fileString);

        const prompts = json.categories.map((category) => {
            return category.prompts.map((prompt) => {
                return new Prompt(prompt.text, prompt.process, prompt.form);
            });
        });

        return prompts.flat(1);
    }

    async getBpmnFiles(): Promise<BpmnFile[]> {
        if (!workspace.workspaceFolders) {
            throw new Error("No workspace folders found");
        }

        const files = await workspace.findFiles("**/*.bpmn");

        const bpmnFiles = workspace.workspaceFolders.map((ws) => {
            return files.map((file) => {
                if (file.path.startsWith(ws.uri.path)) {
                    return new BpmnFile(
                        file.path.split("/").pop()!,
                        ws.uri.path.split("/").pop()!,
                    );
                }
            });
        });

        return bpmnFiles.flat(1).filter((file) => file !== undefined) as BpmnFile[];

        /*const bpmnFiles: BpmnFile[] = [];
        for (const ws of workspace.workspaceFolders) {
            for (const file of files) {
                if (file.path.startsWith(ws.uri.path)) {
                    bpmnFiles.push(
                        new BpmnFile(
                            file.path.split("/").pop()!,
                            ws.uri.path.split("/").pop()!,
                        ),
                    );
                }
            }
        }

        return bpmnFiles;*/
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

    createOrShowWebview(): string {
        return this.webview.showOrCreate();
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
