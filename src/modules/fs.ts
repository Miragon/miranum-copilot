import {Uri, workspace} from "vscode";
import {Buffer} from "node:buffer";

const fs = workspace.fs;

export async function readFile(uri: Uri): Promise<string> {
    const uint8Array = await fs.readFile(uri);
    return Buffer.from(uint8Array).toString();
}

export async function writeFile(uri: Uri, content: string): Promise<void> {
    const uint8Array = Buffer.from(content);
    await fs.writeFile(uri, uint8Array);
}

/**
 * Read a bpmn file and return the process as string.
 * The *bpmndi* section is removed.
 * @param uri
 */
export async function readBpmnFile(uri: Uri): Promise<string> {
    const bpmnFile = await readFile(uri);
    const bpmn = bpmnFile.match(/<bpmn:process[\s\S]*<\/bpmn:process>/);

    if (!bpmn) {
        throw new Error(`No bpmn process found in file ${uri}`);
    }

    return bpmn[0];
}

/**
 * Extract all files with a given extension from a directory recursively.
 */
export async function readFilesFromDirectory(
    extension: string,
): Promise<string[]> {

    const uris = await workspace.findFiles(`**/*.${extension}`);
    const fileNames: string[] = [];

    for (const uri of uris) {
        fileNames.push(uri.fsPath.toString());
    }

    return fileNames;
}
