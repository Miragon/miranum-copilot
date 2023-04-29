import { commands, ExtensionContext } from "vscode";
import { CopilotPanel } from "./CopilotPanel";

export function activate(context: ExtensionContext) {
    console.log("Congratulations, your extension 'copilot' is now active!");
    let disposable = commands.registerCommand("copilot.start", () => {
        CopilotPanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
