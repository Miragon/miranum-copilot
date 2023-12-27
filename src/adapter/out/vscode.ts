import { Uri, workspace } from "vscode";

import {
    BpmnFile as ApplicationBpmnFile,
    DefaultPrompt as ApplicationPrompt,
    DocumentationTemplate as AppDocumentationTemplate,
    Template as AppTemplate,
} from "../../application/model";
import {
    CreateOrShowWebviewOutPort,
    GetBpmnFilesOutPort,
    GetPromptsOutPort,
    GetTemplatesOutPort,
    PostMessageOutPort,
    ReadFileOutPort,
} from "../../application/ports/out";
import {
    BpmnFile as WebviewBpmnFile,
    BpmnFileQuery,
    Prompt as WebviewPrompt,
    PromptQuery,
    Template as WebviewTemplate,
    TemplateQuery,
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

    async getTemplates(): Promise<Map<string, AppTemplate[]>> {
        // TODO: Make custom directories configurable
        const path: string[] = [
            EXTENSION_CONTEXT.getContext().extensionUri.path,
            "resources",
            "templates",
        ];

        const documentationTemplates = await workspace.findFiles(
            `${path.join("/")}/documentation/**/*`,
        );
        const formTemplates = await workspace.findFiles(`${path.join("/")}/form/**/*`);

        return new Map([
            [
                "documentation",
                documentationTemplates.map(
                    (uri) => new AppDocumentationTemplate(uri.path),
                ),
            ],
            ["form", formTemplates.map((uri) => new AppTemplate(uri.path))],
        ]);
    }

    async getPrompts(): Promise<ApplicationPrompt[]> {
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
                return new ApplicationPrompt(prompt.text, prompt.process, prompt.form);
            });
        });

        return prompts.flat(1);
    }

    async getBpmnFiles(): Promise<ApplicationBpmnFile[]> {
        if (!workspace.workspaceFolders) {
            throw new Error("No workspace folders found");
        }

        const files = await workspace.findFiles("**/*.bpmn");

        const bpmnFiles = workspace.workspaceFolders.map((ws) => {
            return files.map((file) => {
                if (file.path.startsWith(ws.uri.path)) {
                    return new ApplicationBpmnFile(
                        file.path.split("/").pop()!,
                        ws.uri.path.split("/").pop()!,
                        file.path,
                    );
                }
            });
        });

        return bpmnFiles
            .flat(1)
            .filter((file) => file !== undefined) as ApplicationBpmnFile[];

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

    sendBpmnFiles(bpmnFiles: ApplicationBpmnFile[]): Promise<boolean> {
        const webviewBpmnFiles = bpmnFiles.map((file) => {
            return new WebviewBpmnFile(file.fileName, file.workspaceName, file.fullPath);
        });
        const bpmnFileQuery = new BpmnFileQuery(webviewBpmnFiles);
        return this.webview.postMessage(bpmnFileQuery);
    }

    sendPrompts(prompts: ApplicationPrompt[]): Promise<boolean> {
        const webviewPrompts = prompts.map((prompt) => {
            return new WebviewPrompt(prompt.prompt, prompt.process, prompt.form);
        });
        const promptQuery = new PromptQuery(webviewPrompts);
        return this.webview.postMessage(promptQuery);
    }

    sendTemplates(templates: Map<string, AppTemplate[]>): Promise<boolean> {
        const webviewTemplates = new Map([
            [
                "documentation",
                (templates.get("documentation") as AppDocumentationTemplate[])?.map(
                    (t) => new WebviewTemplate(t.path, t.getName()),
                ),
            ],
            [
                "form",
                (templates.get("form") as AppTemplate[])?.map(
                    (t) => new WebviewTemplate(t.path, t.getName()),
                ),
            ],
        ]);
        const templateQuery = new TemplateQuery(webviewTemplates);
        return this.webview.postMessage(templateQuery);
    }
}
