import {
    commands,
    Disposable,
    FileType,
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
    CreateDocumentationDialogOutPort,
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
                const uris = await workspace.findFiles(`${path.join("/")}/${dir}/**/*`);
                returnMap.set(
                    dir,
                    uris.map((uri) => new AppTemplate(uri.path)),
                );
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

    // sendTemplates(templates: Map<string, AppTemplate[]>): Promise<boolean> {
    //     const webviewTemplates = new Map<string, WebviewTemplate[]>();

    //     switch (true) {
    //         case templates.has("documentation"): {
    //             webviewTemplates.set(
    //                 "documentation",
    //                 templates
    //                     .get("documentation")!
    //                     .map((t) => new WebviewTemplate(t.path, t.getName())),
    //             );
    //         }
    //         case templates.has("form"): {
    //             webviewTemplates.set(
    //                 "form",
    //                 templates
    //                     .get("form")!
    //                     .map((t) => new WebviewTemplate(t.path, t.getName())),
    //             );
    //         }
    //     }

    //     if (webviewTemplates.size === 0) {
    //         throw new Error("No templates found");
    //     }

    //     const templateQuery = new TemplateQuery(webviewTemplates);
    //     return this.webview.postMessage(templateQuery);
    // }

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

@singleton()
export class CreateDocumentationDialog implements CreateDocumentationDialogOutPort {
    async getBpmnFile(bpmnFiles: AppBpmnFile[]): Promise<AppBpmnFile> {
        const disposables: Disposable[] = [];
        try {
            return await new Promise((resolve, reject) => {
                const quickPick = window.createQuickPick<{
                    label: string;
                    path: string;
                    workspace: string;
                }>();
                const bpmnFileItems = bpmnFiles.map((file) => {
                    return {
                        label: file.fileName,
                        path: file.fullPath,
                        workspace: file.workspaceName,
                    };
                });

                quickPick.title = "Select a BPMN file";
                quickPick.step = 1;
                quickPick.totalSteps = 4;
                quickPick.items = bpmnFileItems;
                quickPick.placeholder = "Select a BPMN file";
                quickPick.busy = true;

                disposables.push(
                    quickPick.onDidChangeSelection((selection) => {
                        const data = selection[0];
                        resolve(new AppBpmnFile(data.label, data.workspace, data.path));
                    }),
                );
            });
        } finally {
            disposables.forEach((d) => d.dispose());
        }
    }

    async getFormat(): Promise<string> {
        const disposables: Disposable[] = [];
        try {
            return await new Promise((resolve, reject) => {
                const quickPick = window.createQuickPick();
                const formatItems = ["md", "json"].map((label) => ({ label }));

                quickPick.title = "Select a file format";
                quickPick.step = 2;
                quickPick.totalSteps = 4;
                quickPick.items = formatItems;
                quickPick.placeholder = "Select a file format";
                quickPick.busy = true;

                disposables.push(
                    quickPick.onDidChangeSelection((selection) =>
                        resolve(selection[0].label),
                    ),
                );
            });
        } finally {
            disposables.forEach((d) => d.dispose());
        }
    }

    async getTemplate(templates: AppTemplate[]): Promise<string> {
        const disposables: Disposable[] = [];
        try {
            return await new Promise((resolve, reject) => {
                const quickPick = window.createQuickPick<{
                    label: string;
                    path: string;
                }>();
                const templateItems = templates.map((template) => {
                    return {
                        label: template.getName(),
                        path: template.path,
                    };
                });

                quickPick.title = "Select a template";
                quickPick.step = 3;
                quickPick.totalSteps = 4;
                quickPick.items = templateItems;
                quickPick.placeholder = "Select a template";
                quickPick.busy = true;

                disposables.push(
                    quickPick.onDidChangeSelection((selection) =>
                        resolve(selection[0].path),
                    ),
                );
            });
        } finally {
            disposables.forEach((d) => d.dispose());
        }
    }

    async getName(): Promise<string> {
        const disposables: Disposable[] = [];
        try {
            return await new Promise((resolve, reject) => {
                const inputBox = window.createInputBox();
                inputBox.title = "Enter a name";
                inputBox.step = 4;
                inputBox.totalSteps = 4;
                inputBox.placeholder = "Enter a name";
                inputBox.prompt = "Enter a name";
                inputBox.busy = true;

                // TODO: Validate input
                disposables.push(inputBox.onDidAccept(() => resolve(inputBox.value)));
            });
        } finally {
            disposables.forEach((d) => d.dispose());
        }
    }
}
