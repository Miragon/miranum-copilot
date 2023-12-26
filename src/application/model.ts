export class BpmnFile {
    public readonly fileName: string;

    public readonly workspaceName: string;

    public readonly fullPath: string;

    constructor(fileName: string, workspaceName: string, fullPath: string) {
        this.fileName = fileName;
        this.workspaceName = workspaceName;
        this.fullPath = fullPath;
    }

    static sortByWorkspaceName(bpmnFiles: BpmnFile[]): BpmnFile[] {
        return bpmnFiles.sort((a, b) => {
            if (a.workspaceName < b.workspaceName) {
                return -1;
            }
            if (a.workspaceName > b.workspaceName) {
                return 1;
            }
            return 0;
        });
    }
}

export class Prompt {
    public readonly prompt: string;

    public readonly process: boolean = false;

    public readonly form: boolean = false;

    constructor(prompt: string, process?: boolean, form?: boolean) {
        this.prompt = prompt;
        this.process = process ?? false;
        this.form = form ?? false;
    }
}

interface PromptCreationParts<T extends string | boolean> {
    base: T;
    process?: T;
    form?: T;
    template?: T;
}

export class PromptCreation {
    private readonly base: string;

    private readonly process?: string;

    private readonly form?: string;

    private readonly template?: string;

    constructor({ base, process, form, template }: PromptCreationParts<string>) {
        this.base = base;
        this.process = process;
        this.form = form;
        this.template = template;
    }

    getTemplateAsJson(): JSON {
        if (!this.template) {
            throw new Error("No template defined");
        }
        return JSON.parse(this.template);
    }

    createPrompt(
        { process, form, template }: PromptCreationParts<boolean> = { base: true },
    ): string {
        let returnValue = this.base;

        if (process) {
            returnValue +=
                "\n\n" +
                "The BPMN Process is delimited by triple quotes." +
                "\n" +
                "'''\n" +
                this.process +
                "\n'''";
        }
        if (form) {
            returnValue +=
                "\n\n" +
                "The Form is delimited by triple equal signs." +
                "\n" +
                "===\n" +
                this.form +
                "\n===";
        }
        if (template) {
            returnValue +=
                "\n\n" +
                "The Template is delimited by triple asterisks." +
                "\n" +
                "***\n" +
                this.template +
                "\n***";
        }

        return returnValue;
    }
}
