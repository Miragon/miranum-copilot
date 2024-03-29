import { Disposable, QuickPickItem, window, workspace } from "vscode";
import { inject, singleton } from "tsyringe";

import {
    CreateDocumentationDialogOutPort,
    CreateFormDialogOutPort,
    ShowProgressOutPort,
} from "../../application/ports/out";
import {
    BpmnFile as AppBpmnFile,
    Template as AppTemplate,
} from "../../application/model";

@singleton()
export class CreateDocumentationDialog implements CreateDocumentationDialogOutPort {
    private readonly progressTitle = "Create Documentation";

    private readonly totalSteps = 4;

    constructor(
        @inject("ShowProgressOutPort")
        private readonly showProgressOutPort: ShowProgressOutPort,
    ) {}

    async getBpmnFile(bpmnFiles: AppBpmnFile[]): Promise<AppBpmnFile> {
        const step = 1;

        type BpmnFileQuickPickItem = QuickPickItem & { bpmnFile: AppBpmnFile };

        const promise = showQuickPick<BpmnFileQuickPickItem>({
            title: "Select a BPMN file",
            step,
            totalSteps: this.totalSteps,
            items: bpmnFiles.map((bpmnFile) => ({
                label: bpmnFile.fileName,
                bpmnFile,
            })),
            placeholder: "Select a BPMN file",
            busy: true,
        });

        const bpmnFileQuickPickItem = await this.showProgressOutPort.showProgress(
            this.progressTitle,
            "Selecting the BPMN file...",
            promise,
            this.progressIncrement(step),
        );

        return bpmnFileQuickPickItem.bpmnFile;
    }

    async getFormat(): Promise<string> {
        const step = 2;

        const promise = showQuickPick({
            title: "Select a file format",
            step,
            totalSteps: this.totalSteps,
            items: ["md", "json"].map((label) => ({ label })),
            placeholder: "Select a file format",
            busy: true,
        });

        const formatQuickPickItem = await this.showProgressOutPort.showProgress(
            this.progressTitle,
            "Selecting the file format...",
            promise,
            this.progressIncrement(step),
        );

        return formatQuickPickItem.label;
    }

    async getTemplate(templates: AppTemplate[]): Promise<AppTemplate> {
        const step = 3;

        type TemplateQuickPickItem = QuickPickItem & { template: AppTemplate };

        const promise = showQuickPick<TemplateQuickPickItem>({
            title: "Select a template",
            step,
            totalSteps: this.totalSteps,
            items: templates.map((template) => ({
                label: template.getName(),
                template,
            })),
            placeholder: "Select a template",
            busy: true,
        });

        const templateQuickPickItem = await this.showProgressOutPort.showProgress(
            this.progressTitle,
            "Selecting the template...",
            promise,
            this.progressIncrement(step),
        );

        return templateQuickPickItem.template;
    }

    async getName(): Promise<string> {
        const step = 4;

        const promise = showInputBox({
            title: "Enter a filename",
            step,
            totalSteps: this.totalSteps,
            placeholder: "Enter a filename",
            prompt: "Enter a filename",
            busy: true,
        });

        return await this.showProgressOutPort.showProgress(
            this.progressTitle,
            "Enter a filename...",
            promise,
            this.progressIncrement(step),
        );
    }

    private progressIncrement(step: number): number {
        return (100 / this.totalSteps) * step;
    }
}

@singleton()
export class CreateFormDialog implements CreateFormDialogOutPort {
    private readonly progressTitle = "Create Documentation";

    private readonly totalSteps = 6;

    constructor(
        @inject("ShowProgressOutPort")
        private readonly showProgressOutPort: ShowProgressOutPort,
    ) {}

    async getPrompt(): Promise<string> {
        const step = 1;

        const promise = showInputBox({
            title: "Enter a prompt",
            step,
            totalSteps: this.totalSteps,
            placeholder: "Enter a prompt",
            prompt: "Enter a prompt",
            busy: true,
        });

        return await this.showProgressOutPort.showProgress(
            this.progressTitle,
            "Enter a prompt...",
            promise,
            this.progressIncrement(step),
        );
    }

    async getFields(): Promise<string[]> {
        const step = 2;

        const promise = showInputBox({
            title: "(Optional) Insert the fields the form should contain separated by a comma",
            step,
            totalSteps: this.totalSteps,
            placeholder:
                "Insert the fields the form should contain separated by a comma",
            prompt: "Enter a field",
            busy: true,
        });

        const fields = await this.showProgressOutPort.showProgress(
            this.progressTitle,
            "Enter fields...",
            promise,
            this.progressIncrement(step),
        );

        return fields.split(",").filter((field) => field !== undefined && field !== "");
    }

    async getFormat(): Promise<string> {
        const step = 3;

        const promise = showQuickPick({
            title: "Select a file format",
            step,
            totalSteps: this.totalSteps,
            items: ["form.json"].map((label) => ({ label })),
            placeholder: "Select a file format",
            busy: true,
        });

        const formatQuickPickItem = await this.showProgressOutPort.showProgress(
            this.progressTitle,
            "Selecting the file format...",
            promise,
            this.progressIncrement(step),
        );

        return formatQuickPickItem.label;
    }

    async getTemplate(templates: AppTemplate[]): Promise<AppTemplate> {
        const step = 4;

        type TemplateQuickPickItem = QuickPickItem & { template: AppTemplate };

        const promise = showQuickPick<TemplateQuickPickItem>({
            title: "Select a template",
            step,
            totalSteps: this.totalSteps,
            items: templates.map((template) => ({
                label: template.getName(),
                template,
            })),
            placeholder: "Select a template",
            busy: true,
        });

        const templateQuickPickItem = await this.showProgressOutPort.showProgress(
            this.progressTitle,
            "Selecting the template...",
            promise,
            this.progressIncrement(step),
        );

        return templateQuickPickItem.template;
    }

    async getWorkspace(): Promise<string> {
        if (!workspace.workspaceFolders) {
            throw new Error("No workspace folders found");
        } else if (workspace.workspaceFolders.length === 1) {
            return workspace.workspaceFolders[0].name;
        }

        const step = 5;

        const promise = showQuickPick({
            title: "Select a workspace where the form will get saved",
            step,
            totalSteps: this.totalSteps,
            items: workspace.workspaceFolders.map((ws) => ({ label: ws.name })),
            placeholder: "Select a workspace where the form will get saved",
            busy: true,
        });

        const templateQuickPickItem = await this.showProgressOutPort.showProgress(
            this.progressTitle,
            "Selecting the workspace...",
            promise,
            this.progressIncrement(step),
        );

        return templateQuickPickItem.label;
    }

    async getName(): Promise<string> {
        const step = 6;

        const promise = showInputBox({
            title: "Enter a filename",
            step,
            totalSteps: this.totalSteps,
            placeholder: "Enter a filename",
            prompt: "Enter a filename",
            busy: true,
        });

        return await this.showProgressOutPort.showProgress(
            this.progressTitle,
            "Enter a filename...",
            promise,
            this.progressIncrement(step),
        );
    }

    private progressIncrement(step: number): number {
        return (100 / this.totalSteps) * step;
    }
}

interface QuickPickItemParams<T> {
    title: string;
    step: number;
    totalSteps: number;
    items: T[];
    placeholder: string;
    busy: boolean;
}

interface InputBoxParams {
    title: string;
    step: number;
    totalSteps: number;
    placeholder: string;
    prompt: string;
    busy: boolean;
}

async function showQuickPick<T extends QuickPickItem>({
    title,
    step,
    totalSteps,
    items,
    placeholder,
    busy,
}: QuickPickItemParams<T>): Promise<T> {
    const disposables: Disposable[] = [];
    try {
        return await new Promise((resolve, reject) => {
            const quickPick = window.createQuickPick<T>();

            quickPick.title = title;
            quickPick.step = step;
            quickPick.totalSteps = totalSteps;
            quickPick.items = items;
            quickPick.placeholder = placeholder;
            quickPick.busy = busy;

            disposables.push(
                quickPick.onDidChangeSelection((selection) => resolve(selection[0])),
                quickPick.onDidHide(() => reject()),
            );

            quickPick.show();
        });
    } finally {
        disposables.forEach((d) => d.dispose());
    }
}

async function showInputBox({
    title,
    step,
    totalSteps,
    prompt,
    placeholder,
    busy,
}: InputBoxParams): Promise<string> {
    const disposables: Disposable[] = [];
    try {
        return await new Promise((resolve, reject) => {
            const inputBox = window.createInputBox();
            inputBox.title = title;
            inputBox.step = step;
            inputBox.totalSteps = totalSteps;
            inputBox.placeholder = placeholder;
            inputBox.prompt = prompt;

            // TODO: Validate input
            disposables.push(
                inputBox.onDidAccept(() => {
                    inputBox.enabled = false;
                    inputBox.busy = true;
                    resolve(inputBox.value)
                    inputBox.enabled = true;
                    inputBox.busy = false;
                    inputBox.hide();
                }),
                inputBox.onDidHide(() => reject()),
            );

            inputBox.show();
        });
    } finally {
        disposables.forEach((d) => d.dispose());
    }
}
