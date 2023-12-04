import { FileSystemWatcher, RelativePattern, Uri, workspace } from "vscode";
import { debounce } from "lodash";

import { readFile } from "./fs";

export function createPromptsWatcher(
    extensionUri: Uri,
    cb: (prompts: string) => void,
): FileSystemWatcher {
    // need to debounce the event listener because it gets called for every letter typed or removed
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

/**
 * Creates a watcher for given extension.
 * @param extension The extension to watch for (e.g. ".bpmn").
 * @param cb The callback function to call when a file is created or deleted.
 */
export function createWatcher(
    extension: string,
    cb: (fileNames: string[]) => void,
): FileSystemWatcher {
    const watcher = workspace.createFileSystemWatcher(
        `**/*${extension}`,
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

        const uris = await workspace.findFiles(`**/*${extension}`);
        const fileNames: string[] = [];

        for (const uri of uris) {
            fileNames.push(uri.fsPath.toString());
        }

        cb(fileNames);
    }
}
