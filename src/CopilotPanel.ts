import { Disposable, Uri, ViewColumn, WebviewPanel, window } from "vscode";

export class CopilotPanel {
    public static readonly VIEWTYPE: string = "miranum-copilot";

    public static currentPanel: CopilotPanel | undefined;
    private readonly panel: WebviewPanel;
    private readonly extensionUri: Uri;
    private disposables: Disposable[] = [];

    private constructor(panel: WebviewPanel, extensionUri: Uri) {
        this.panel = panel;
        this.extensionUri = extensionUri;

        this.panel.title = "Miranum Copilot";
        this.panel.webview.html = this.getHtml();

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            (message) => {
                switch (message.type) {
                    case "alert":
                        window.showErrorMessage(message.content);
                        return;
                }
            },
            null,
            this.disposables
        );

        this.panel.webview.postMessage({});

        // Upate the content based on view changes
        this.panel.onDidChangeViewState(() => {}, null, this.disposables);

        // Liten for when the panel is disposed
        // Ths happens when the user closes the panel or when the panel is closed programmatically
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
            CopilotPanel.VIEWTYPE,
            "Miranum Copilot",
            column || ViewColumn.Beside,
            {
                enableScripts: true,
            }
        );

        CopilotPanel.currentPanel = new CopilotPanel(panel, extensionUri);
    }

    private dispose() {}

    private getHtml() {
        const webview = this.panel.webview;

        const stylesResetUri = webview.asWebviewUri(
            Uri.joinPath(this.extensionUri, "resources", "css", "reset.css")
        );
        const scriptUri = webview.asWebviewUri(
            Uri.joinPath(this.extensionUri, "dist", "client", "webview.mjs")
        );

        const nonce = this.getNonce();

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
                <div id="app"></div>
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
