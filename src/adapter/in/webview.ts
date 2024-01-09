import { Disposable, Uri, ViewColumn, WebviewPanel, window } from "vscode";
import { container, inject, singleton } from "tsyringe";

import { ExtensionContextHelper } from "../../utils";
import { WebviewAdapter, WorkspaceWatcherAdapter } from "./vscode";
import { Command, GetAiResponseCommand, MiranumCopilotQuery, Query } from "../../shared";

@singleton()
export class CopilotWebview {
    private readonly viewType = "miranum-copilot";

    private readonly webviewPath;

    private panel?: WebviewPanel;

    private disposables: Disposable[] = [];

    constructor(
        @inject(ExtensionContextHelper)
        private readonly extensionContextHelper: ExtensionContextHelper,
        @inject("WebviewPath") webviewPath: string,
    ) {
        this.webviewPath = webviewPath;
    }

    private get webview() {
        if (!this.panel?.webview) {
            throw new Error("Webview is not initialized");
        }
        return this.panel.webview;
    }

    showOrCreate(): string {
        if (this.panel) {
            this.panel.reveal();
            return "Webview already exists";
        } else {
            this.create();
            return "Webview created";
        }
    }

    async postMessage(message: MiranumCopilotQuery): Promise<boolean> {
        return (await this.webview.postMessage(message)) ?? false;
    }

    private create() {
        const extensionUri = this.extensionContextHelper.context.extensionUri;
        this.panel = window.createWebviewPanel(
            this.viewType,
            "Miranum IDE",
            ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [Uri.joinPath(extensionUri, this.webviewPath)],
            },
        );

        this.onDidReceiveMessage(); // have to be called before setting the html otherwise we may miss the first message

        // Configure the webview
        this.panel.title = "Miranum Copilot";
        this.panel.iconPath = Uri.joinPath(extensionUri, "images", "miranum_icon.png");
        this.panel.webview.html = this.getHtml(extensionUri);

        this.panel.onDidDispose(() => {
            container.resolve(WorkspaceWatcherAdapter).dispose();
            this.dispose();
        });
    }

    private dispose(): void {
        this.panel!.dispose();
        this.panel = undefined;

        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private onDidReceiveMessage() {
        const webview = this.panel?.webview;
        if (!webview) {
            throw new Error("Webview is not initialized");
        }

        const webviewAdapter = container.resolve(WebviewAdapter);

        webview.onDidReceiveMessage(
            async (message: Command | Query) => {
                switch (true) {
                    case message.type === "GetPromptsCommand": {
                        webviewAdapter.sendPrompts();
                        break;
                    }
                    case message.type === "GetBpmnFilesCommand": {
                        webviewAdapter.sendBpmnFiles();
                        break;
                    }
                    case message.type === "GetAiResponseCommand": {
                        webviewAdapter.sendAiResponse(message as GetAiResponseCommand);
                        break;
                    }
                }
            },
            undefined,
            this.disposables,
        );
    }

    private getHtml(extensionUri: Uri): string {
        const webview = this.panel?.webview;
        if (!webview) {
            throw new Error("Webview is not initialized");
        }

        const baseUri = Uri.joinPath(extensionUri, this.webviewPath);

        const scriptUri = webview.asWebviewUri(Uri.joinPath(baseUri, "main.js"));
        const styleUri = webview.asWebviewUri(Uri.joinPath(baseUri, "main.css"));
        const codiconUri = webview.asWebviewUri(
            Uri.joinPath(baseUri, "codicons", "codicon.css"),
        );

        const nonce = getNonce();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />

                <meta http-equiv="Content-Security-Policy" content="default-src 'none';
                    style-src ${webview.cspSource} https: 'unsafe-inline';
                    img-src ${webview.cspSource};
                    font-src ${webview.cspSource};
                    script-src 'nonce-${nonce}' 'unsafe-eval';"/>

                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

                <link href="${styleUri}" rel="stylesheet" type="text/css" />
                <link href="${codiconUri}" rel="stylesheet" type="text/css" />

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
