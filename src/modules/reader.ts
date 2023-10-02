import { FileType, Uri, workspace } from "vscode";
import { Buffer } from "node:buffer";

const fs = workspace.fs;

export async function readFile(uri: Uri): Promise<string> {
    const uint8Array = await fs.readFile(uri);
    return Buffer.from(uint8Array).toString();
}

/**
 * Extract all files with a given extension from a directory recursively.
 */
export async function readFilesFromDirectory(
    uri: Uri,
    extension: string,
): Promise<string[]> {
    const files = await fs.readDirectory(uri);
    const result: string[] = [];
    for (const file of files) {
        const [name, type] = file;
        if (type === FileType.File && name.endsWith(extension)) {
            result.push(name);
        } else if (type === FileType.Directory) {
            result.push(
                ...(await readFilesFromDirectory(Uri.joinPath(uri, name), extension)),
            );
        }
    }
    return result;
}
