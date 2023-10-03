import { Disposable, Uri, ViewColumn, WebviewPanel, window } from "vscode";

import { CopilotMessageData, MessageType, Prompt, VscMessage } from "./shared/types";
import { getCompletion } from "./modules/openai";

import { Logger } from "./Logger";
import { readFile, readFilesFromDirectory } from "./modules/reader";
import { createPromptsWatcher, createWatcher } from "./modules/watcher";

export class CopilotPanel {
    public static readonly viewType: string = "miranum-copilot";

    public static currentPanel: CopilotPanel | undefined;
    private readonly panel: WebviewPanel;
    private readonly extensionUri: Uri;
    private disposables: Disposable[] = [];

    private buffer: Partial<CopilotMessageData> | undefined;

    private constructor(panel: WebviewPanel, extensionUri: Uri) {
        Logger.get().clear();

        this.panel = panel;
        this.extensionUri = extensionUri;

        this.panel.title = "Miranum Copilot";
        this.panel.iconPath = Uri.joinPath(extensionUri, "images", "miranum_icon.png");
        this.panel.webview.html = this.getHtml();

        const initialData = this.init(extensionUri);

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            async (message: VscMessage<string>) => {
                try {
                    switch (message.type) {
                        case `${CopilotPanel.viewType}.${MessageType.initialize}`: {
                            Logger.info(
                                "[Miranum.Copilot]",
                                `(Webview: ${this.panel.title})`,
                                message.logger ?? "",
                            );
                            const copilotMessageData: CopilotMessageData = {
                                prompts: (await initialData.get("prompts")) as string,
                                bpmnFiles: (await initialData.get(
                                    "bpmnFiles",
                                )) as string[],
                            };
                            await this.postMessage(
                                MessageType.initialize,
                                copilotMessageData,
                            );
                            break;
                        }
                        case `${CopilotPanel.viewType}.${MessageType.restore}`: {
                            Logger.info(
                                "[Miranum.Copilot]",
                                `(Webview: ${this.panel.title})`,
                                message.logger ?? "",
                            );
                            if (
                                await this.postMessage(MessageType.restore, this.buffer)
                            ) {
                                this.buffer = undefined;
                            }
                            break;
                        }
                        case `${CopilotPanel.viewType}.${MessageType.msgFromWebview}`: {
                            try {
                                const copilotMessageData: CopilotMessageData = {
                                    response: await this.getResponseFromApi(
                                        message.data,
                                    ),
                                };
                                await this.postMessage(
                                    MessageType.msgFromExtension,
                                    copilotMessageData,
                                );
                            } catch (err) {
                                const errMsg =
                                    err instanceof Error ? err.message : `${err}`;
                                Logger.error("[Miranum.Copilot.OpenAI]", errMsg);
                                window.showErrorMessage("Miranum Copilot: " + errMsg);
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
                    Logger.error(
                        "[Miranum.Copilot]",
                        `(Webview: ${this.panel.title})`,
                        message,
                    );
                }
            },
            null,
            this.disposables,
        );
        this.panel.webview.postMessage({});
        this.panel.onDidChangeViewState(() => {}, null, this.disposables);

        const promptsWatcher = createPromptsWatcher(extensionUri, (prompts: string) => {
            this.postMessage(MessageType.msgFromExtension, { prompts });
        });
        const bpmnWatcher = createWatcher(".bpmn", (bpmnFiles: string[]) => {
            this.postMessage(MessageType.msgFromExtension, { bpmnFiles });
        });

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
        data?: CopilotMessageData,
    ): Promise<boolean> {
        const message: VscMessage<CopilotMessageData> = {
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

    private getHtml(): string {
        const webview = this.panel.webview;

        const stylesResetUri: Uri = webview.asWebviewUri(
            Uri.joinPath(this.extensionUri, "dist", "client", "main.css"),
        );
        const scriptUri: Uri = webview.asWebviewUri(
            Uri.joinPath(this.extensionUri, "dist", "client", "main.js"),
        );

        const nonce: string = this.getNonce();

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

    private getNonce(): string {
        let text = "";
        const possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private async getResponseFromApi(prompt?: string): Promise<string> {
        if (!prompt) {
            throw Error("No prompt given!");
        }

        const promptObject: Prompt = JSON.parse(prompt);
        return await getCompletion(promptObject);
    }
}
