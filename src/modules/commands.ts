import { commands, Disposable, Uri, window } from "vscode";
import { CopilotPanel } from "../CopilotPanel";

export function registerCommands(extensionUri: Uri): Disposable[] {
    const disposables: Disposable[] = [];

    disposables.push(startCopilot(extensionUri));
    disposables.push(editPrompts(extensionUri));

    return disposables;
}

function startCopilot(extensionUri: Uri): Disposable {
    return commands.registerCommand("copilot.start", () => {
        CopilotPanel.createOrShow(extensionUri);
    });
}

function editPrompts(extensionUri: Uri): Disposable {
    return commands.registerCommand("copilot.editPrompts", () => {
        const uri = Uri.joinPath(extensionUri, "resources", "prompts", "prompts.json");
        window.showTextDocument(uri);
    });
}
