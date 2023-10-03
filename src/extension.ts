import { ExtensionContext } from "vscode";

import { registerCommands } from "./modules/commands";
import { Logger } from "./Logger";

export function activate(context: ExtensionContext) {
    const disposables = registerCommands(context.extensionUri);

    context.subscriptions.push(Logger.get("Miranum: Copilot"));
    context.subscriptions.push(...disposables);
}

export function deactivate() {}
