import { commands, ExtensionContext } from "vscode";
import { CopilotPanel } from "./CopilotPanel";
import { Logger } from "./Logger";

export function activate(context: ExtensionContext) {
    let disposable = commands.registerCommand("copilot.start", () => {
        CopilotPanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(Logger.get("Miranum: Copilot"));
    context.subscriptions.push(disposable);
}

export function deactivate() {}
