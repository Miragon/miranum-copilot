import { container } from "tsyringe";

import {
    CreateFormUseCase,
    CreateOrShowWebviewUseCase,
    CreateProcessDocumentationUseCase,
    GetBpmnFilesUseCase,
    GetPromptsUseCase,
    GetTemplatesUseCase,
    SendAiResponseUseCase,
    SendToUiUseCase,
} from "./application/usecases";
import {
    CreateDocumentationDialog,
    VsCodeWindow,
    WebviewAdapter,
    WorkspaceAdapter,
} from "./adapter/out/vscode";
import { OpenAIApiAdapter } from "./adapter/out/openai";

export async function config(): Promise<boolean> {
    try {
        await Promise.all([
            registerPrimitiveValues(),
            registerOutAdapter(),
            registerUseCases(),
        ]);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function registerPrimitiveValues(): Promise<void> {
    container.register("WebviewPath", { useValue: "dist/client" });
}

async function registerOutAdapter(): Promise<void> {
    // VS Code
    container.register("ReadFileOutPort", { useClass: WorkspaceAdapter });
    container.register("GetPromptsOutPort", { useClass: WorkspaceAdapter });
    container.register("GetBpmnFilesOutPort", { useClass: WorkspaceAdapter });
    container.register("GetTemplatesOutPort", { useClass: WorkspaceAdapter });
    container.register("CreateFileOutPort", { useClass: WorkspaceAdapter });
    container.register("CreateOrShowUiOutPort", { useClass: WebviewAdapter });

    container.register("PostMessageOutPort", { useClass: WebviewAdapter });

    container.register("ShowMessageOutPort", { useClass: VsCodeWindow });

    container.register("CreateDocumentationDialogOutPort", {
        useClass: CreateDocumentationDialog,
    });

    // OpenAI
    container.register("GetAiResponseOutPort", { useClass: OpenAIApiAdapter });
}

async function registerUseCases(): Promise<void> {
    container.register("CreateOrShowUiInPort", { useClass: CreateOrShowWebviewUseCase });
    container.register("GetBpmnFilesInPort", { useClass: GetBpmnFilesUseCase });
    container.register("GetPromptsInPort", { useClass: GetPromptsUseCase });
    container.register("GetTemplatesInPort", { useClass: GetTemplatesUseCase });
    container.register("SendToUiInPort", { useClass: SendToUiUseCase });
    container.register("CreateProcessDocumentationInPort", {
        useClass: CreateProcessDocumentationUseCase,
    });
    container.register("CreateFormInPort", { useClass: CreateFormUseCase });
    container.register("SendAiResponseInPort", { useClass: SendAiResponseUseCase });
}
