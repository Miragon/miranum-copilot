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
        private extensionContext: ExtensionContextHelper,
        @inject("CreateOrShowUiInPort")
        private readonly createOrShowUiInPort: CreateOrShowUiInPort,
    ) {
        // const extensionContext = EXTENSION_CONTEXT.getContext();
        const disposables = this.registerCommands(extensionContext.context.extensionUri);
        this.extensionContext.context.subscriptions.push(...disposables);
    }

    createOrShowWebview() {
        this.createOrShowUiInPort.createOrShowWebview();
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

    async sendTemplates() {
        const templates = await this.getTemplatesInPort.getTemplates();
        this.sendToUiInPort.sendTemplates(templates);
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
            "my-form.form.json",
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
    private readonly watchers: FileSystemWatcher[] = [];

    constructor(
        private extensionContext: ExtensionContextHelper,
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

        // Watch for new or deleted templates
        const templateUri = Uri.joinPath(extensionUri, "resources", "templates");
        this.watchers.push(
            this.registerUriWatcher(
                templateUri,
                "**/*",
                this.updateTemplates.bind(this),
            ),
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

    async updateTemplates() {
        const templates = await this.getTemplatesInPort.getTemplates();
        this.sendToUiInPort.sendTemplates(templates);
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
