import { Uri, ViewColumn, WebviewPanel, window } from "vscode";
import { container, inject, singleton } from "tsyringe";

import { Command, MiranumCopilotQuery, Query } from "../shared";
import { EXTENSION_CONTEXT } from "../utils";
import { WebviewAdapter } from "./in/vscode";

@singleton()
export class CopilotWebview {
    private readonly viewType = "miranum-copilot";

    private readonly webviewPath;

    private panel?: WebviewPanel;

    constructor(@inject("WebviewPath") webviewPath: string) {
        this.webviewPath = webviewPath;
    }

    private get webview() {
        if (!this.panel?.webview) {
            throw new Error("Webview is not initialized");
        }
        return this.panel.webview;
    }

    showOrCreate() {
        if (this.panel) {
            this.panel.reveal();
        } else {
            this.create();
        }
    }

    async postMessage(message: MiranumCopilotQuery): Promise<boolean> {
        return (await this.webview.postMessage(message)) ?? false;
    }

    private create() {
        const extensionUri = EXTENSION_CONTEXT.getContext().extensionUri;
        this.panel = window.createWebviewPanel(
            this.viewType,
            "Miranum IDE",
            ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [Uri.joinPath(extensionUri, this.webviewPath)],
            },
        );

        this.onDidReceiveMessage(); // have to be called before setting the html otherwise we may miss the first message
        // this.panel.webview.options = {};
        this.panel.webview.html = this.getHtml(extensionUri);

        return true;
    }

    private onDidReceiveMessage() {
        const webview = this.panel?.webview;
        if (!webview) {
            throw new Error("Webview is not initialized");
        }

        const webviewAdapter = container.resolve(WebviewAdapter);

        webview.onDidReceiveMessage(async (message: Command | Query) => {
            switch (true) {
                case message.type === "GetPromptsCommand": {
                    webviewAdapter.sendPrompts();
                    break;
                }
                case message.type === "GetBpmnFilesCommand": {
                    webviewAdapter.sendBpmnFiles();
                    break;
                }
                case message.type === "CreateProcessDocumentationCommand": {
                    webviewAdapter.createProcessDocumentation();
                    break;
                }
                case message.type === "CreateFormCommand": {
                    webviewAdapter.createForm();
                    break;
                }
                case message.type === "GetAiResponseCommand": {
                    webviewAdapter.sendAiResponse();
                    break;
                }
            }
        });
    }

    private getHtml(extensionUri: Uri): string {
        const webview = this.panel?.webview;
        if (!webview) {
            throw new Error("Webview is not initialized");
        }

        const baseUri = Uri.joinPath(extensionUri, this.webviewPath);

        const scriptUri = webview.asWebviewUri(Uri.joinPath(baseUri, "index.js"));
        const styleUri = webview.asWebviewUri(Uri.joinPath(baseUri, "index.css"));

        const nonce = getNonce();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />

                <meta http-equiv="Content-Security-Policy" content="default-src 'none';
                    style-src ${webview.cspSource} https: 'unsafe-inline';
                    img-src ${webview.cspSource} data:;
                    font-src ${webview.cspSource} https:;
                    script-src 'nonce-${nonce}' 'unsafe-eval';"/>

                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

                <link href="${styleUri}" rel="stylesheet" type="text/css" />

                <title>Miranum Copilot</title>
            </head>
            <body>
                <div id="app"></div>
                <script type="text/javascript" src="${scriptUri}" nonce="${nonce}"></script>
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
