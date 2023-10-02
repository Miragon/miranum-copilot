import { FileSystemWatcher, RelativePattern, Uri, workspace } from "vscode";
import { debounce } from "lodash";

import { readFile } from "./reader";

export function createPromptsWatcher(
    extensionUri: Uri,
    cb: (prompts: string) => void,
): FileSystemWatcher {
    const debounced = debounce(eventListener, 100);
    const uri = Uri.joinPath(extensionUri, "resources", "prompts");

    const watcher = workspace.createFileSystemWatcher(
        new RelativePattern(uri, "prompts.json"),
        true,
    );

    watcher.onDidChange(debounced);
    watcher.onDidChange(debounced);

    return watcher;

    async function eventListener() {
        const prompts = await readFile(Uri.joinPath(uri, "prompts.json"));
        cb(prompts);
    }
}

export function createWatcher(
    extension: string,
    cb: (fileNames: string[]) => void,
): FileSystemWatcher {
    const watcher = workspace.createFileSystemWatcher(
        new RelativePattern("**", "*.bpmn"),
        false,
        true,
        false,
    );

    watcher.onDidCreate(eventListener);
    watcher.onDidDelete(eventListener);

    return watcher;

    async function eventListener(event: Uri) {
        if (!event.fsPath.endsWith(extension)) {
            return;
        }

        const uris = await workspace.findFiles("**/*.bpmn");
        const fileNames: string[] = [];

        for (const uri of uris) {
            fileNames.push(uri.fsPath.toString());
        }

        cb(fileNames);
    }
}
