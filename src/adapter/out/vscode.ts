import { commands, FileType, Uri, ViewColumn, window, workspace } from "vscode";
import { Buffer } from "node:buffer";

import { ExtensionContextHelper } from "../../utils";
import { CopilotWebview } from "../in/webview";
import {
    CreateFileOutPort,
    CreateOrShowUiOutPort,
    GetBpmnFilesOutPort,
    GetPromptsOutPort,
    GetTemplatesOutPort,
    PostMessageOutPort,
    ReadFileOutPort,
    ShowMessageOutPort,
} from "../../application/ports/out";
import {
    BpmnFile as ApplicationBpmnFile,
    DefaultPrompt as ApplicationPrompt,
    FileExtension,
    Template as AppTemplate,
} from "../../application/model";
import {
    AiResponseQuery,
    BpmnFile as WebviewBpmnFile,
    BpmnFileQuery,
    Prompt as WebviewPrompt,
    PromptQuery,
    Template as WebviewTemplate,
    TemplateQuery,
} from "../../shared";
import { singleton } from "tsyringe";

type DefaultPromptsSchema = {
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

@singleton()
export class WorkspaceAdapter
    implements
        ReadFileOutPort,
        GetPromptsOutPort,
        GetBpmnFilesOutPort,
        GetTemplatesOutPort,
        CreateFileOutPort
{
    private readonly fs = workspace.fs;

    constructor(private extensionContext: ExtensionContextHelper) {}

    async readFile(filePath: string): Promise<string> {
        const uri = Uri.file(filePath);
        const uint8Array = await this.fs.readFile(uri);
        return Buffer.from(uint8Array).toString();
    }

    async getTemplates(): Promise<Map<string, AppTemplate[]>> {
        // TODO: Make custom directories configurable
        const path: string[] = [
            this.extensionContext.context.extensionUri.path,
            "resources",
            "templates",
        ];

        const templateDirs = await this.fs.readDirectory(Uri.file(path.join("/")));

        const returnMap = new Map<string, AppTemplate[]>();
        for (const [dir, type] of templateDirs) {
            if (type === FileType.Directory) {
                const uris = await workspace.findFiles(`${path.join("/")}/${dir}/**/*`);
                returnMap.set(
                    dir,
                    uris.map((uri) => new AppTemplate(uri.path)),
                );
            }
        }

        return returnMap;

        // const documentationTemplates = await workspace.findFiles(
        //     `${path.join("/")}/documentation/**/*`,
        // );
        // const formTemplates = await workspace.findFiles(`${path.join("/")}/form/**/*`);

        // return new Map([
        //     [
        //         "documentation",
        //         documentationTemplates.map((uri) => new AppTemplate(uri.path)),
        //     ],
        //     ["form", formTemplates.map((uri) => new AppTemplate(uri.path))],
        // ]);
    }

    async getPrompts(): Promise<ApplicationPrompt[]> {
        const path: string[] = [
            this.extensionContext.context.extensionUri.path,
            "resources",
            "prompts",
            "prompts.json",
        ];

        const file = await this.readFile(path.join("/"));
        const json: DefaultPromptsSchema = JSON.parse(file);

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
                        ws.name,
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

    async createFile(
        fileName: string,
        fileExtension: FileExtension,
        fileContent: string,
        workspaceName?: string,
    ) {
        if (!workspace.workspaceFolders) {
            throw new Error("No workspace open");
        }

        let ws: Uri;
        if (!workspaceName) {
            ws = workspace.workspaceFolders[0].uri;
        } else {
            ws = getWorkspaceByName(workspaceName);
        }

        const file = Uri.joinPath(ws, "docs", `${fileName}.${fileExtension.extension}`);
        const uint8Array = Buffer.from(fileContent);
        await this.fs.writeFile(file, uint8Array);
        commands.executeCommand("vscode.open", file, ViewColumn.Beside);
        return true;
    }
}

function getWorkspaceByName(workspaceName: string): Uri {
    if (!workspace.workspaceFolders) {
        throw new Error("No workspace open");
    }

    const uri = workspace.workspaceFolders.find((ws) => ws.name === workspaceName)?.uri;

    if (!uri) {
        throw new Error(`Workspace ${workspaceName} not found`);
    }

    return uri;
}

@singleton()
export class WebviewAdapter implements CreateOrShowUiOutPort, PostMessageOutPort {
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
        const webviewTemplates = new Map<string, WebviewTemplate[]>();

        switch (true) {
            case templates.has("documentation"): {
                webviewTemplates.set(
                    "documentation",
                    templates
                        .get("documentation")!
                        .map((t) => new WebviewTemplate(t.path, t.getName())),
                );
            }
            case templates.has("form"): {
                webviewTemplates.set(
                    "form",
                    templates
                        .get("form")!
                        .map((t) => new WebviewTemplate(t.path, t.getName())),
                );
            }
        }

        if (webviewTemplates.size === 0) {
            throw new Error("No templates found");
        }

        const templateQuery = new TemplateQuery(webviewTemplates);
        return this.webview.postMessage(templateQuery);
    }

    sendAiResponse(response: string): Promise<boolean> {
        const aiResponseQuery = new AiResponseQuery(response);
        return this.webview.postMessage(aiResponseQuery);
    }
}

@singleton()
export class VsCodeWindow implements ShowMessageOutPort {
    async showInformationMessage(message: string): Promise<boolean> {
        await window.showInformationMessage(message);
        return true;
    }

    async showErrorMessage(message: string): Promise<boolean> {
        await window.showErrorMessage(message);
        return true;
    }
}
