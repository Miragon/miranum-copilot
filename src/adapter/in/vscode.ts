import {
    commands,
    Disposable,
    FileSystemWatcher,
    RelativePattern,
    Uri,
    window,
    workspace,
} from "vscode";
import { inject, singleton } from "tsyringe";
import { debounce } from "lodash";

import { ExtensionContextHelper } from "../../utils";
import {
    CreateFormInPort,
    CreateOrShowUiInPort,
    CreateProcessDocumentationInPort,
    GetBpmnFilesInPort,
    GetPromptsInPort,
    GetTemplatesInPort,
    SendAiResponseInPort,
    SendToUiInPort,
} from "../../application/ports/in";
import { GetAiResponseCommand } from "../../shared";
import { BpmnFile, PromptCreation } from "../../application/model";

@singleton()
export class CommandAdapter {
    constructor(
        @inject(ExtensionContextHelper)
        private readonly extensionContext: ExtensionContextHelper,
        @inject("CreateOrShowUiInPort")
        private readonly createOrShowUiInPort: CreateOrShowUiInPort,
        @inject("CreateProcessDocumentationInPort")
        private readonly createProcessDocumentationInPort: CreateProcessDocumentationInPort,
        @inject("CreateFormInPort") private readonly createFormInPort: CreateFormInPort,
        @inject("GetBpmnFilesInPort")
        private readonly getBpmnFilesInPort: GetBpmnFilesInPort,
        @inject("GetTemplatesInPort")
        private readonly getTemplatesInPort: GetTemplatesInPort,
    ) {
        const commands = [
            this.createOrShowUi(),
            this.editPrompts(extensionContext.context.extensionUri),
            this.showCreateDocumentationDialog(),
            this.showCreateFormDialog(),
        ];

        this.extensionContext.context.subscriptions.push(...commands);
    }

    createOrShowWebview() {
        this.createOrShowUiInPort.createOrShowWebview();
    }

    async createProcessDocumentation() {
        const bpmnFiles = await this.getBpmnFilesInPort.getBpmnFiles();
        const templates = (await this.getTemplatesInPort.getTemplates()).get(
            "documentation",
        );

        if (!templates) {
            throw new Error("No documentation templates found");
        }

        this.createProcessDocumentationInPort.createProcessDocumentation(
            bpmnFiles,
            templates,
        );
    }

    async createForm() {
        const templates = (await this.getTemplatesInPort.getTemplates()).get("form");

        if (!templates) {
            throw new Error("No documentation templates found");
        }

        this.createFormInPort.createForm(templates);
    }

    private createOrShowUi(): Disposable {
        return commands.registerCommand("miranum-copilot.createOrShow", () => {
            this.createOrShowWebview();
        });
    }

    private editPrompts(extensionUri: Uri): Disposable {
        return commands.registerCommand("miranum-copilot.editPrompts", () => {
            const uri = Uri.joinPath(
                extensionUri,
                "resources",
                "prompts",
                "prompts.json",
            );
            window.showTextDocument(uri);
        });
    }

    private showCreateDocumentationDialog(): Disposable {
        return commands.registerCommand("miranum-copilot.createDocumentation", () => {
            this.createProcessDocumentation();
        });
    }

    private showCreateFormDialog(): Disposable {
        return commands.registerCommand("miranum-copilot.createForm", () => {
            this.createForm();
        });
    }
}

@singleton()
export class WebviewAdapter {
    constructor(
        @inject("GetBpmnFilesInPort")
        private readonly getBpmnFilesInPort: GetBpmnFilesInPort,
        @inject("GetPromptsInPort")
        private readonly getPromptsInPort: GetPromptsInPort,
        @inject("GetTemplatesInPort")
        private readonly getTemplatesInPort: GetTemplatesInPort,
        @inject("SendToUiInPort")
        private readonly sendToUiInPort: SendToUiInPort,
        @inject("CreateProcessDocumentationInPort")
        private readonly createProcessDocumentationInPort: CreateProcessDocumentationInPort,
        @inject("CreateFormInPort") private readonly createFormInPort: CreateFormInPort,
        @inject("SendAiResponseInPort")
        private readonly sendAiResponseInPort: SendAiResponseInPort,
    ) {}

    async sendBpmnFiles() {
        const bpmnFiles = await this.getBpmnFilesInPort.getBpmnFiles();
        this.sendToUiInPort.sendBpmnFiles(bpmnFiles);
    }

    async sendPrompts() {
        const prompts = await this.getPromptsInPort.getPrompts();
        this.sendToUiInPort.sendPrompts(prompts);
    }

    sendAiResponse(getAiResponseCommand: GetAiResponseCommand) {
        const prompt = new PromptCreation({
            base: getAiResponseCommand.prompt,
        });
        const bpmnFile = getAiResponseCommand.bpmnFile
            ? new BpmnFile(
                getAiResponseCommand.bpmnFile.fileName,
                getAiResponseCommand.bpmnFile.workspaceName,
                getAiResponseCommand.bpmnFile.fullPath,
            )
            : undefined;
        this.sendAiResponseInPort.sendAiResponse(prompt, bpmnFile);
    }
}

@singleton()
export class WorkspaceWatcherAdapter {
    private readonly watchers: FileSystemWatcher[] = [];

    constructor(
        @inject(ExtensionContextHelper)
        private readonly extensionContext: ExtensionContextHelper,
        @inject("GetBpmnFilesInPort")
        private readonly getBpmnFilesInPort: GetBpmnFilesInPort,
        @inject("GetPromptsInPort")
        private readonly getPromptsInPort: GetPromptsInPort,
        @inject("GetTemplatesInPort")
        private readonly getTemplatesInPort: GetTemplatesInPort,
        @inject("SendToUiInPort")
        private readonly sendToUiInPort: SendToUiInPort,
    ) {
        const extensionUri = this.extensionContext.context.extensionUri;

        // Watch for new or deleted bpmn files
        this.watchers.push(
            this.registerOpenWorkspacesWatcher(".bpmn", this.updateBpmnFiles.bind(this)),
        );

        // Watch for new or deleted prompts
        const promptsUri = Uri.joinPath(extensionUri, "resources", "prompts");
        this.watchers.push(
            this.registerUriWatcher(
                promptsUri,
                "prompts.json",
                this.updatePrompts.bind(this),
            ),
        );
    }

    async updatePrompts() {
        // Read the entire prompts.json file and send it to the UI
        const prompts = await this.getPromptsInPort.getPrompts();
        this.sendToUiInPort.sendPrompts(prompts);
    }

    async updateBpmnFiles() {
        const bpmnFiles = await this.getBpmnFilesInPort.getBpmnFiles();
        this.sendToUiInPort.sendBpmnFiles(bpmnFiles);
    }

    dispose() {
        for (const watcher of this.watchers) {
            watcher.dispose();
        }
    }

    private registerOpenWorkspacesWatcher(
        extension: string,
        cb: () => void,
    ): FileSystemWatcher {
        const debounced = debounce(cb, 100);

        const watcher = workspace.createFileSystemWatcher(
            `**/*${extension}`,
            false,
            true,
            false,
        );

        watcher.onDidCreate(debounced);
        watcher.onDidDelete(debounced);

        return watcher;
    }

    private registerUriWatcher(
        uri: Uri,
        filePattern: string,
        cb: () => void,
    ): FileSystemWatcher {
        const debounced = debounce(cb, 100);

        const watcher = workspace.createFileSystemWatcher(
            new RelativePattern(uri, filePattern),
            true,
        );

        watcher.onDidCreate(debounced);
        watcher.onDidDelete(debounced);

        return watcher;
    }
}
