import {
    commands,
    FileType,
    ProgressLocation,
    Uri,
    ViewColumn,
    window,
    workspace,
} from "vscode";
import { inject, singleton } from "tsyringe";
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
    ShowProgressOutPort,
} from "../../application/ports/out";
import {
    BpmnFile as AppBpmnFile,
    DefaultPrompt as AppPrompt,
    FileExtension,
    Template as AppTemplate,
} from "../../application/model";
import {
    AiResponseQuery,
    BpmnFile as WebviewBpmnFile,
    BpmnFileQuery,
    DefaultPrompt as WebviewPrompt,
    PromptQuery,
} from "../../shared";

type DefaultPromptsSchema = {
    categories: {
        name: string;
        prompts: {
            text: string;
            process?: boolean;
            form?: boolean;
        }[];
    }[];
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

    constructor(
        @inject(ExtensionContextHelper)
        private readonly extensionContext: ExtensionContextHelper,
    ) {}

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
                const pathString = `${path.join("/")}/${dir}`;
                const files = await this.fs.readDirectory(Uri.file(pathString));

                const templateMap = files
                    .map((file) => {
                        if (file[1] === FileType.File) {
                            return new AppTemplate(`${pathString}/${file[0]}`);
                        }
                    })
                    .filter((file) => file !== undefined) as AppTemplate[];

                returnMap.set(dir, templateMap);
            }
        }

        return returnMap;
    }

    async getPrompts(): Promise<Map<string, AppPrompt[]>> {
        const path: string[] = [
            this.extensionContext.context.extensionUri.path,
            "resources",
            "prompts",
            "prompts.json",
        ];

        const file = await this.readFile(path.join("/"));
        const json: DefaultPromptsSchema = JSON.parse(file);

        const returnMap = new Map<string, AppPrompt[]>();
        for (const category of json.categories) {
            const prompts = category.prompts.map((prompt) => {
                return new AppPrompt(prompt.text, prompt.process, prompt.form);
            });
            returnMap.set(category.name, prompts);
        }

        return returnMap;
    }

    async getBpmnFiles(): Promise<AppBpmnFile[]> {
        if (!workspace.workspaceFolders) {
            throw new Error("No workspace folders found");
        }

        const files = await workspace.findFiles("**/*.bpmn");

        const bpmnFiles = workspace.workspaceFolders.map((ws) => {
            return files.map((file) => {
                if (file.path.startsWith(ws.uri.path)) {
                    return new AppBpmnFile(
                        file.path.split("/").pop()!,
                        ws.name,
                        file.path,
                    );
                }
            });
        });

        return bpmnFiles.flat(1).filter((file) => file !== undefined) as AppBpmnFile[];
    }

    async createFile(
        fileName: string,
        fileExtension: FileExtension,
        fileContent: string,
        workspaceName?: string,
        relativePath?: string,
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

        const file = Uri.joinPath(
            ws,
            relativePath ?? "",
            `${fileName}.${fileExtension.extension}`,
        );
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
    constructor(@inject(CopilotWebview) private readonly webview: CopilotWebview) {}

    createOrShowWebview(): string {
        return this.webview.showOrCreate();
    }

    sendBpmnFiles(bpmnFiles: AppBpmnFile[]): Promise<boolean> {
        const webviewBpmnFiles = bpmnFiles.map((file) => {
            return new WebviewBpmnFile(file.fileName, file.workspaceName, file.fullPath);
        });
        const bpmnFileQuery = new BpmnFileQuery(webviewBpmnFiles);
        return this.webview.postMessage(bpmnFileQuery);
    }

    sendPrompts(prompts: Map<string, AppPrompt[]>): Promise<boolean> {
        const webviewPrompts = new Map<string, WebviewPrompt[]>();
        for (const [category, appPrompts] of prompts) {
            webviewPrompts.set(
                category,
                appPrompts.map((p) => new WebviewPrompt(p.prompt, p.process, p.form)),
            );
        }
        const promptQuery = new PromptQuery(webviewPrompts);
        return this.webview.postMessage(promptQuery);
    }

    sendAiResponse(response: string): Promise<boolean> {
        const aiResponseQuery = new AiResponseQuery(response);
        return this.webview.postMessage(aiResponseQuery);
    }
}

@singleton()
export class VsCodeWindow implements ShowMessageOutPort, ShowProgressOutPort {
    async showInformationMessage(message: string): Promise<boolean> {
        await window.showInformationMessage(message);
        return true;
    }

    async showErrorMessage(message: string): Promise<boolean> {
        await window.showErrorMessage(message);
        return true;
    }

    async showProgress<T>(
        titel: string,
        message: string,
        promise: Promise<T>,
        increment?: number,
    ): Promise<T> {
        return window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: titel,
                cancellable: true,
            },
            async (progress, token) => {
                token.onCancellationRequested(() => {
                    this.showInformationMessage(
                        "User canceled the long running operation",
                    );
                });

                progress.report({ message, increment });
                return await promise;
            },
        );
    }
}
