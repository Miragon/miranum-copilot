import { Uri, workspace } from "vscode";

import { Prompt } from "../../application/model";
import {
    CreateOrShowWebviewOutPort,
    GetBpmnFilesOutPort,
    GetPromptsOutPort,
    GetTemplatesOutPort,
    PostMessageOutPort,
    ReadFileOutPort,
} from "../../application/ports/out";
import {
    BpmnFile,
    MiranumCopilotCommand,
    MiranumCopilotQuery,
    Template,
    TemplateExtension,
} from "../../shared";
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

export class WorkspaceAdapter
    implements
        ReadFileOutPort,
        GetPromptsOutPort,
        GetBpmnFilesOutPort,
        GetTemplatesOutPort
{
    private readonly fs = workspace.fs;

    async readFile(filePath: string): Promise<string> {
        const uri = Uri.file(filePath);
        const uint8Array = await this.fs.readFile(uri);
        return Buffer.from(uint8Array).toString();
    }

    async getTemplates(): Promise<Template[]> {
        const path: string[] = [
            EXTENSION_CONTEXT.getContext().extensionUri.path,
            "resources",
            "templates",
        ];

        const files = await workspace.findFiles(path.join("/"), "**/*");

        return files.map((uri) => {
            const file = uri.path.split("/").pop()!;
            return new Template(file, file.split(".").pop() as TemplateExtension);
        });
    }

    async getPrompts(): Promise<Prompt[]> {
        const path: string[] = [
            EXTENSION_CONTEXT.getContext().extensionUri.path,
            "resources",
            "prompts",
            "prompts.json",
        ];

        const file = await this.readFile(path.join("/"));
        const json: PromptsSchema = JSON.parse(file);

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
                        file.path,
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

export class WebviewAdapter implements CreateOrShowWebviewOutPort, PostMessageOutPort {
    constructor(private readonly webview: CopilotWebview) {}

    createOrShowWebview(): string {
        return this.webview.showOrCreate();
    }

    postMessage(message: MiranumCopilotCommand | MiranumCopilotQuery): Promise<boolean> {
        return this.webview.postMessage(message);
    }
}
