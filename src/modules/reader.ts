import { Uri, workspace } from "vscode";
import { Buffer } from "node:buffer";

const fs = workspace.fs;

export async function readFile(uri: Uri): Promise<string> {
    const uint8Array = await fs.readFile(uri);
    return Buffer.from(uint8Array).toString();
}
