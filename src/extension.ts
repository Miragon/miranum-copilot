import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    console.log("Congratulations, your extension 'copilot' is now active!");
    let disposable = vscode.commands.registerCommand("copilot.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World from copilot!");
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
