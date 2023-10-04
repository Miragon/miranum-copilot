import {commands, Disposable, Uri, ViewColumn, WebviewPanel, window, workspace,} from "vscode";

import {
    DocumentationPrompt,
    isInstanceOfDefaultPrompt,
    isInstanceOfDocumentationPrompt,
    MessageToWebview,
    MessageType,
    OutputFormat,
    Prompt,
    VscMessage,
} from "./shared";
import {getCompletion, getCompletionWithSchema} from "./modules/openai";

import {Logger} from "./Logger";
import {readBpmnFile, readFile, readFilesFromDirectory, writeFile} from "./modules/fs";
import {createPromptsWatcher, createWatcher} from "./modules/watcher";
import {jsonPrompt, markdownPrompt} from "./modules/processDocumentation";

export class CopilotPanel {
    public static readonly viewType: string = "miranum-copilot";

    public static currentPanel: CopilotPanel | undefined;
    private readonly panel: WebviewPanel;
    private readonly extensionUri: Uri;
    private disposables: Disposable[] = [];

    private initialData: Map<string, Promise<string | string[]>>;
    private buffer: Partial<MessageToWebview> | undefined;

    private constructor(panel: WebviewPanel, extensionUri: Uri) {
        Logger.get().clear();

        this.panel = panel;
        this.extensionUri = extensionUri;

        this.panel.title = "Miranum Copilot";
        this.panel.iconPath = Uri.joinPath(extensionUri, "images", "miranum_icon.png");
        this.panel.webview.html = this.getHtml();

        this.initialData = this.init(extensionUri);

        //this.panel.webview.postMessage({});

        //
        // Handle events from the webview.
        //
        this.panel.webview.onDidReceiveMessage(
            async (message: VscMessage<Prompt>) => this.receiveMessage(message),
            null,
            this.disposables,
        );

        this.panel.onDidChangeViewState(() => {
        }, null, this.disposables);

        //
        // Create File System Watchers
        //
        const promptsWatcher = createPromptsWatcher(extensionUri, (prompts: string) => {
            this.postMessage(MessageType.msgFromExtension, {prompts});
        });
        const bpmnWatcher = createWatcher(".bpmn", (bpmnFiles: string[]) => {
            this.postMessage(MessageType.msgFromExtension, {bpmnFiles});
        });

        //
        // Webview gets disposed when the panel is closed
        //
        this.panel.onDidDispose(
            () => {
                promptsWatcher.dispose();
                bpmnWatcher.dispose();
                this.dispose();
            },
            null,
            this.disposables,
        );
    }

    public static createOrShow(extensionUri: Uri) {
        const column = window.activeTextEditor
            ? window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (CopilotPanel.currentPanel) {
            CopilotPanel.currentPanel.panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = window.createWebviewPanel(
            CopilotPanel.viewType,
            "Miranum Copilot",
            column || ViewColumn.Beside,
            {
                enableScripts: true,
            },
        );

        CopilotPanel.currentPanel = new CopilotPanel(panel, extensionUri);
    }

    private dispose(): void {
        CopilotPanel.currentPanel = undefined;

        // Clean up our resources
        this.panel.dispose();

        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private init(extensionUri: Uri): Map<string, Promise<string | string[]>> {
        const promises: Map<string, Promise<string | string[]>> = new Map();
        promises.set(
            "prompts",
            readFile(Uri.joinPath(extensionUri, "resources", "prompts", "prompts.json")),
        );
        promises.set("bpmnFiles", readFilesFromDirectory("bpmn"));

        return promises;
    }

    private async postMessage(
        messageType: MessageType,
        data?: MessageToWebview,
    ): Promise<boolean> {
        const message: VscMessage<MessageToWebview> = {
            type: `${CopilotPanel.viewType}.${messageType}`,
            data,
        };

        const res: boolean = await this.panel.webview.postMessage(message);

        if (!res) {
            if (!this.panel.visible) {
                this.buffer = {
                    ...data,
                };
            }
            Logger.error(
                "[Miranum.Copilot]",
                `(Webview: ${this.panel.title})`,
                "Could not post message!",
            );
        }

        return res;
    }

    private async receiveMessage(message: VscMessage<Prompt>): Promise<void> {
        try {
            switch (message.type) {
                case `${CopilotPanel.viewType}.${MessageType.initialize}`: {
                    Logger.info(
                        "[Miranum.Copilot]",
                        `(Webview: ${this.panel.title})`,
                        message.logger ?? "",
                    );
                    const copilotMessageData: MessageToWebview = {
                        prompts: (await this.initialData.get("prompts")) as string,
                        bpmnFiles: (await this.initialData.get("bpmnFiles")) as string[],
                    };
                    await this.postMessage(MessageType.initialize, copilotMessageData);
                    break;
                }
                case `${CopilotPanel.viewType}.${MessageType.restore}`: {
                    Logger.info(
                        "[Miranum.Copilot]",
                        `(Webview: ${this.panel.title})`,
                        message.logger ?? "",
                    );
                    if (await this.postMessage(MessageType.restore, this.buffer)) {
                        this.buffer = undefined;
                    }
                    break;
                }
                case `${CopilotPanel.viewType}.${MessageType.msgFromWebview}`: {
                    try {
                        const messageToWebview: MessageToWebview = {
                            response: await handleReceivedMessage(
                                this.extensionUri,
                                message.data,
                            ),
                        };
                        await this.postMessage(
                            MessageType.msgFromExtension,
                            messageToWebview,
                        );
                    } catch (err) {
                        const errMsg = err instanceof Error ? err.message : `${err}`;
                        Logger.error("[Miranum.Copilot.OpenAI]", errMsg);
                        window.showErrorMessage("Miranum Copilot: " + errMsg);
                        // End loading animation
                        this.postMessage(MessageType.msgFromExtension, {response: false});
                    }
                    break;
                }
                case `${CopilotPanel.viewType}.${MessageType.info}`: {
                    Logger.info(
                        "[Miranum.Copilot.Webview]",
                        `(Webview: ${this.panel.title}`,
                        message.logger ?? "",
                    );
                    break;
                }
                case `${CopilotPanel.viewType}.${MessageType.error}`: {
                    Logger.error(
                        "[Miranum.Copilot.Webview]",
                        `(Webview: ${this.panel.title}`,
                        message.logger ?? "",
                    );
                    break;
                }
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : `${error}`;
            Logger.error("[Miranum.Copilot]", `(Webview: ${this.panel.title})`, message);
        }
    }

    private getHtml(): string {
        const webview = this.panel.webview;

        const stylesResetUri: Uri = webview.asWebviewUri(
            Uri.joinPath(this.extensionUri, "dist", "client", "main.css"),
        );
        const scriptUri: Uri = webview.asWebviewUri(
            Uri.joinPath(this.extensionUri, "dist", "client", "main.js"),
        );

        const nonce: string = getNonce();

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" 
                content="default-src 'none'; 
                        style-src ${webview.cspSource} 'unsafe-inline'; 
                        img-src ${webview.cspSource} https:; 
                        script-src 'nonce-${nonce}';">
            <link href="${stylesResetUri}" rel="stylesheet">
            <title>Miranum Copilot</title>
        </head>
        <body>
            <div id="app"></div>
            <script type="text/javascript" nonce="${nonce}">
                const globalViewType = '${CopilotPanel.viewType}';
            </script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>
    `;
    }
}

function getNonce(): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function handleReceivedMessage(
    extensionUri: Uri,
    prompt?: Prompt,
): Promise<string | boolean> {
    if (!prompt) {
        throw Error("No prompt given!");
    }

    if (isInstanceOfDefaultPrompt(prompt)) {
        return await getCompletion(
            await createPrompt(
                prompt.text,
                await readBpmnFile(Uri.file(prompt.process as string)),
            ),
        );
    } else if (isInstanceOfDocumentationPrompt(prompt)) {
        if (await createProcessDocumentation(extensionUri, prompt)) {
            window.showInformationMessage("Process documentation created!");
            return true;
        }
    }
    return false;
}

export async function createProcessDocumentation(
    extensionUri: Uri,
    documentationPrompt: DocumentationPrompt,
): Promise<boolean> {
    const process = readBpmnFile(Uri.file(documentationPrompt.process));

    let res: string;
    let fileName: string;

    switch (documentationPrompt.format) {
        case OutputFormat.json: {
            const templateUri = documentationPrompt.template
                ? Uri.file(documentationPrompt.template)
                : Uri.joinPath(
                    extensionUri,
                    "resources",
                    "templates",
                    "documentation.schema.json",
                );
            const template = documentationPrompt.template
                ? readFile(templateUri)
                : readFile(templateUri);

            const prompt = await createPrompt(jsonPrompt, await process);

            fileName = "documentation.json";
            res = await getCompletionWithSchema(
                prompt,
                JSON.parse(await template),
                "gpt-4",
            );

            const json = JSON.parse(res);
            if (!json.$schema) {
                json.$schema = templateUri.fsPath;
                res = JSON.stringify(json, null, 2);
            } else {
                res = JSON.stringify(json, null, 2);
            }

            break;
        }
        case OutputFormat.md:
        default: {
            const template = documentationPrompt.template
                ? readFile(Uri.file(documentationPrompt.template))
                : readFile(
                    Uri.joinPath(
                        extensionUri,
                        "resources",
                        "templates",
                        "documentation.md",
                    ),
                );
            const prompt = await createPrompt(
                markdownPrompt,
                await process,
                undefined,
                await template,
            );

            fileName = "documentation.md";
            res = await getCompletion(prompt, "gpt-4");
        }
    }

    if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
        for (const folder of workspace.workspaceFolders) {
            if (documentationPrompt.process.startsWith(folder.uri.fsPath)) {
                const file = Uri.joinPath(folder.uri, "docs", fileName);
                await writeFile(file, res);
                commands.executeCommand("vscode.open", file, ViewColumn.Beside);
                return true;
            }
        }
    } else {
        window.showErrorMessage("No workspace opened!");
    }

    return false;
}

async function createPrompt(
    base: string,
    process?: string,
    form?: string,
    template?: string,
): Promise<string> {
    let returnValue = base;

    if (process) {
        returnValue =
            returnValue +
            "\n\n" +
            "The BPMN Process is delimited by triple quotes." +
            "\n" +
            "'''\n" +
            process +
            "\n'''";
    }
    if (form) {
        returnValue =
            returnValue +
            "\n\n" +
            "The Form is delimited by triple equal signs." +
            "\n" +
            "===\n" +
            form +
            "\n===";
    }
    if (template) {
        returnValue =
            returnValue +
            "\n\n" +
            "The Template is delimited by triple asterisks." +
            "\n" +
            "***\n" +
            template +
            "\n***";
    }

    return returnValue;
}
