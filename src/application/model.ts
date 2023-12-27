export class BpmnFile {
    readonly fileName: string;

    readonly workspaceName: string;

    readonly fullPath: string;

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

export class DefaultPrompt {
    readonly prompt: string;

    readonly process: boolean = false;

    readonly form: boolean = false;

    constructor(prompt: string, process?: boolean, form?: boolean) {
        this.prompt = prompt;
        this.process = process ?? false;
        this.form = form ?? false;
    }
}

interface PromptCreationParts {
    base: string;
    process?: string;
    form?: string;
    template?: string;
}

export class PromptCreation {
    private readonly base: string;

    private process?: string;

    private form?: string;

    private template?: string;

    constructor({ base, process, form, template }: PromptCreationParts) {
        this.base = base;
        this.process = process;
        this.form = form;
        this.template = template;
    }

    setProcess(process: string): PromptCreation {
        this.process = process;
        return this;
    }

    setForm(form: string): PromptCreation {
        this.form = form;
        return this;
    }

    setTemplate(template: string): PromptCreation {
        this.template = template;
        return this;
    }

    getTemplateAsJson(): JSON {
        if (!this.template) {
            throw new Error("No template defined");
        }
        return JSON.parse(this.template);
    }

    createPrompt(): string {
        let returnValue = this.base;

        if (this.process) {
            returnValue +=
                "\n\n" +
                "The BPMN Process is delimited by triple quotes." +
                "\n" +
                "'''\n" +
                this.process +
                "\n'''";
        }
        if (this.form) {
            returnValue +=
                "\n\n" +
                "The Form is delimited by triple equal signs." +
                "\n" +
                "===\n" +
                this.form +
                "\n===";
        }
        if (this.template) {
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

export class Template {
    readonly path: string;

    constructor(path: string) {
        this.path = path;
    }

    getName() {
        const name = this.path.split("/").pop();
        if (!name) {
            throw new Error("No name found");
        }
        return name;
    }
}

abstract class FileFormat {
    readonly extension: string;

    constructor(extension: string) {
        if (!this.isExtensionValid()) {
            throw new Error(`Extension ${extension} is not valid`);
        }
        this.extension = extension;
    }

    abstract isExtensionValid(): boolean;
}

export class DocumentationFormat extends FileFormat {
    private readonly validExtensions = new Set(["json", "md"]);

    constructor(extension: string) {
        super(extension);
    }

    isExtensionValid(): boolean {
        return this.validExtensions.has(this.extension);
    }
}

export class FormFormat extends FileFormat {
    private readonly validExtensions = new Set(["form.json"]);

    constructor(extension: string) {
        super(extension);
    }

    isExtensionValid(): boolean {
        return this.validExtensions.has(this.extension);
    }
}

// export class DocumentationTemplate extends Template {
//     // eslint-disable-next-line @typescript-eslint/naming-convention
//     private Extension = class {
//         private readonly validExtensions = new Set(["json", "md"]);
//
//         constructor(public readonly extension: string) {
//             this.extension = extension;
//         }
//
//         isExtensionValid(): boolean {
//             return this.validExtensions.has(this.extension);
//         }
//     };
//
//     constructor(path: string) {
//         super(path);
//     }
//
//     getExtension() {
//         // TODO: What about file.schema.json?
//         const extension = this.path.split(".").pop();
//         if (!extension) {
//             throw new Error("No extension found");
//         }
//         return new this.Extension(extension);
//     }
// }
