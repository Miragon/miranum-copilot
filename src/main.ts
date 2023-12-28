import { ExtensionContext } from "vscode";
import { container } from "tsyringe";

import { ExtensionContextHelper } from "./utils";

export function activate(context: ExtensionContext) {
    container.resolve(ExtensionContextHelper).context = context;
}

export function deactivate() {}
