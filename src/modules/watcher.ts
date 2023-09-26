import { FileSystemWatcher, RelativePattern, Uri, workspace } from "vscode";
import { readFile } from "./reader";

export function createPromptsWatcher(
    extensionUri: Uri,
    cb: (prompts: string) => void,
): FileSystemWatcher {
    const uri = Uri.joinPath(extensionUri, "resources", "prompts");

    const watcher = workspace.createFileSystemWatcher(
        new RelativePattern(uri, "prompts.json"),
        true,
    );

    watcher.onDidChange(eventListener);
    watcher.onDidChange(eventListener);

    return watcher;

    async function eventListener() {
        const prompts = await readFile(Uri.joinPath(uri, "prompts.json"));
        cb(prompts);
    }
}
