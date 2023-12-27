import { commands, Disposable, Uri, window } from "vscode";
import { inject, singleton } from "tsyringe";

import {
    CreateFormInPort,
    CreateOrShowWebviewInPort,
    CreateProcessDocumentationInPort,
    SendAiResponseInPort,
    UpdateBpmnFilesInPort,
    UpdatePromptsInPort,
} from "../../application/ports/in";
import { EXTENSION_CONTEXT } from "../../utils";
import {
    CreateFormCommand,
    CreateProcessDocumentationCommand,
    GetAiResponseCommand,
} from "../../shared";
import {
    BpmnFile,
    DocumentationExtension,
    FormExtension,
    PromptCreation,
    Template,
} from "../../application/model";

@singleton()
export class CommandAdapter {
    constructor(
        @inject("CreateOrShowWebviewInPort")
        private readonly createOrShowWebviewInPort: CreateOrShowWebviewInPort,
    ) {
        const extensionContext = EXTENSION_CONTEXT.getContext();
        const disposables = this.registerCommands(extensionContext.extensionUri);
        extensionContext.subscriptions.push(...disposables);
    }

    createOrShowWebview() {
        this.createOrShowWebviewInPort.createOrShowWebview();
    }

    private registerCommands(extensionUri: Uri): Disposable[] {
        const disposables: Disposable[] = [];

        disposables.push(
            commands.registerCommand("miranum-copilot.createOrShow", () => {
                this.createOrShowWebview();
            }),
        );

        disposables.push(
            commands.registerCommand("miranum.copilot.editPrompts", () => {
                const uri = Uri.joinPath(
                    extensionUri,
                    "resources",
                    "prompts",
                    "prompts.json",
                );
                window.showTextDocument(uri);
            }),
        );

        return disposables;
    }
}

@singleton()
export class WebviewAdapter {
    constructor(
        @inject("CreateOrShowWebviewInPort")
        private readonly createOrShowWebviewInPort: CreateOrShowWebviewInPort,
        @inject("CreateProcessDocumentationInPort")
        private readonly createProcessDocumentationInPort: CreateProcessDocumentationInPort,
        @inject("CreateFormInPort") private readonly createFormInPort: CreateFormInPort,
        @inject("SendAiResponseInPort")
        private readonly sendAiResponseInPort: SendAiResponseInPort,
    ) {}

    sendTemplates() {
        this.createOrShowWebviewInPort.sendTemplates();
    }

    sendPrompts() {
        this.createOrShowWebviewInPort.sendPrompts();
    }

    sendBpmnFiles() {
        this.createOrShowWebviewInPort.sendBpmnFiles();
    }

    createProcessDocumentation(
        createProcessDocumentationCommand: CreateProcessDocumentationCommand,
    ) {
        const webviewBpmnFile = createProcessDocumentationCommand.bpmnFile;
        const bpmnFile = new BpmnFile(
            webviewBpmnFile.fileName,
            webviewBpmnFile.workspaceName,
            webviewBpmnFile.fullPath,
        );
        const template = new Template(createProcessDocumentationCommand.templatePath);
        // FIXME: documentation name
        this.createProcessDocumentationInPort.createProcessDocumentation(
            `documentation.${createProcessDocumentationCommand.fileFormat}}`,
            bpmnFile,
            template,
            new DocumentationExtension(createProcessDocumentationCommand.fileFormat),
        );
    }

    createForm(createFormCommand: CreateFormCommand) {
        const prompt = new PromptCreation({ base: createFormCommand.prompt.prompt });
        const template = new Template(createFormCommand.templatePath);
        // FIXME: form name
        this.createFormInPort.createForm(
            "form.form.json",
            prompt,
            template,
            new FormExtension("form.json"),
        );
    }

    sendAiResponse(getAiResponseCommand: GetAiResponseCommand) {
        const prompt = new PromptCreation({ base: getAiResponseCommand.prompt.prompt });
        this.sendAiResponseInPort.sendAiResponse(prompt);
    }
}

@singleton()
export class WorkspaceWatcherAdapter {
    constructor(
        @inject("UpdatePromptsInPort")
        private readonly updatePromptsInPort: UpdatePromptsInPort,
        @inject("UpdateBpmnFilesInPort")
        private readonly updateBpmnFilesInPort: UpdateBpmnFilesInPort,
    ) {}

    updatePrompts() {
        this.updatePromptsInPort.updatePrompts();
    }

    updateBpmnFiles() {
        this.updateBpmnFilesInPort.updateBpmnFiles();
    }
}
