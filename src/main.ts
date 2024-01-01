import "reflect-metadata";
import { ExtensionContext } from "vscode";
import { container } from "tsyringe";

import { ExtensionContextHelper } from "./utils";
import { config } from "./main.config";
import {
    CommandAdapter,
    WebviewAdapter,
    WorkspaceWatcherAdapter,
} from "./adapter/in/vscode";

export async function activate(context: ExtensionContext) {
    container.resolve(ExtensionContextHelper).context = context;
    await config();

    // Call all in adapter otherwise tsyringe will not create the instances
    container.resolve(CommandAdapter);
    container.resolve(WebviewAdapter);
    container.resolve(WorkspaceWatcherAdapter);
}

export function deactivate() {}
