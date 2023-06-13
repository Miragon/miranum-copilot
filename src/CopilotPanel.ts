import { Disposable, Uri, ViewColumn, WebviewPanel, window } from "vscode";
import { Logger } from "./Logger";
import { MessageType, VscMessage } from "./shared/types";

export class CopilotPanel {
    public static readonly viewType: string = "miranum-copilot";

    public static currentPanel: CopilotPanel | undefined;
    private readonly panel: WebviewPanel;
    private readonly extensionUri: Uri;
    private disposables: Disposable[] = [];

    private constructor(panel: WebviewPanel, extensionUri: Uri) {
        Logger.get().clear();

        this.panel = panel;
        this.extensionUri = extensionUri;

        this.panel.title = "Miranum Copilot";
        this.panel.webview.html = this.getHtml();

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            async (message: VscMessage<JSON>) => {
                try {
                    switch (message.type) {
                        case `${CopilotPanel.viewType}.${MessageType.initialize}`: {
                            Logger.info(
                                "[Miranum.Copilot]",
                                `(Webview: ${this.panel.title})`,
                                message.info ?? ""
                            );
                            await this.postMessage(
                                MessageType.initialize,
                                // send initial data
                                JSON.parse("{ \"example\": \"Hello World\" }")
                            );
                            break;
                        }
                        case `${CopilotPanel.viewType}.${MessageType.restore}`: {
                            Logger.info(
                                "[Miranum.Copilot]",
                                `(Webview: ${this.panel.title})`,
                                message.info ?? ""
                            );
                            await this.postMessage(MessageType.restore);
                            break;
                        }
                        case `${CopilotPanel.viewType}.${MessageType.msgFromWebview}`: {
                            // react on message
                            break;
                        }
                        case `${CopilotPanel.viewType}.${MessageType.info}`: {
                            Logger.info(
                                "[Miranum.Copilot.Webview]",
                                `(Webview: ${this.panel.title}`,
                                message.info ?? ""
                            );
                            break;
                        }
                        case `${CopilotPanel.viewType}.${MessageType.error}`: {
                            Logger.error(
                                "[Miranum.Copilot.Webview]",
                                `(Webview: ${this.panel.title}`,
                                message.info ?? ""
                            );
                            break;
                        }
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : `${error}`;
                    Logger.error(
                        "[Miranum.Copilot]",
                        `(Webview: ${this.panel.title})`,
                        message
                    );
                }
            },
            null,
            this.disposables
        );

        this.panel.webview.postMessage({});

        this.panel.onDidChangeViewState(() => {}, null, this.disposables);

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
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
            }
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

    private async postMessage(messageType: MessageType, data?: JSON) {
        const res: boolean = await this.panel.webview.postMessage({
            type: `${CopilotPanel.viewType}.${messageType}`,
            data,
        });
        if (!res) {
            Logger.error(
                "[Miranum.Copilot]",
                `(Webview: ${this.panel.title})`,
                `Could not post message (Viewtype: ${this.panel.visible})`
            );
        }
    }

    private getHtml(): string {
        const webview = this.panel.webview;

        const stylesResetUri: Uri = webview.asWebviewUri(
            Uri.joinPath(this.extensionUri, "resources", "css", "reset.css")
        );
        const scriptUri: Uri = webview.asWebviewUri(
            Uri.joinPath(this.extensionUri, "dist", "client", "webview.mjs")
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
                            style-src ${webview.cspSource}; 
                            img-src ${webview.cspSource} https:; 
                            script-src 'nonce-${nonce}';">
                <link href="${stylesResetUri}" rel="stylesheet">
                <title>Miranum Copilot</title>
            </head>
            <body>
                <div id="app">
                <p><vscode-text-area id="inputText" placeholder="Enter your prompt here" resize="both">Your question:</vscode-text-area>
                <vscode-button id="submitButton">Send Prompt</vscode-button><br>
                <vscode-text-area id="outputText" readonly>Response from ChatGPT</vscode-text-area>
                </p>
                </div>
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
}
