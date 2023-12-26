import { Command, Query } from "./common";

export class Prompt<T extends string | boolean> {
    public readonly prompt: string;

    public readonly process?: T;

    public readonly form?: T;

    constructor(prompt: string, process?: T, form?: T) {
        this.prompt = prompt;
        this.process = process;
        this.form = form;
    }
}

export class BpmnFile {
    public readonly fileName: string;

    public readonly workspaceName: string;

    public readonly fullPath: string;

    constructor(fileName: string, workspaceName: string, fullPath: string) {
        this.fileName = fileName;
        this.workspaceName = workspaceName;
        this.fullPath = fullPath;
    }
}

export enum TemplateExtension {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JSON = "json",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    MARKDOWN = "md",
}

export class Template {
    public readonly path: string;

    public readonly extension: TemplateExtension;

    constructor(path: string, extension: TemplateExtension) {
        this.path = path;
        this.extension = extension;
    }
}

// Commands
export interface MiranumCopilotCommand extends Command {}

export class GetTemplatesCommand implements MiranumCopilotCommand {
    public readonly type = "GetTemplatesCommand";
}

export class GetPromptsCommand implements MiranumCopilotCommand {
    public readonly type = "GetPromptsCommand";
}

export class GetBpmnFilesCommand implements MiranumCopilotCommand {
    public readonly type = "GetBpmnFilesCommand";
}

export class CreateProcessDocumentationCommand implements MiranumCopilotCommand {
    public readonly type = "CreateProcessDocumentationCommand";

    public readonly bpmnFile: BpmnFile;

    public readonly template: Template;

    constructor(bpmnFile: BpmnFile, template: Template) {
        this.bpmnFile = bpmnFile;
        this.template = template;
    }
}

export class CreateFormCommand implements MiranumCopilotCommand {
    public readonly type = "CreateFormCommand";

    public readonly prompt: Prompt<string>;

    public readonly formName: string;

    constructor(prompt: Prompt<string>, formName: string) {
        this.prompt = prompt;
        this.formName = formName;
    }
}

export class GetAiResponseCommand implements MiranumCopilotCommand {
    public readonly type = "GetAiResponseCommand";

    public readonly prompt: Prompt<string>;

    constructor(prompt: Prompt<string>) {
        this.prompt = prompt;
    }
}

// Queries
export interface MiranumCopilotQuery extends Query {}

export class TemplateQuery implements MiranumCopilotQuery {
    public readonly type = "TemplateQuery";

    public readonly templates: Template[];

    constructor(templates: Template[]) {
        this.templates = templates;
    }
}

export class PromptQuery implements MiranumCopilotQuery {
    public readonly type = "PromptQuery";

    public readonly prompts: Prompt<boolean>[];

    constructor(prompts: Prompt<boolean>[]) {
        this.prompts = prompts;
    }
}

export class BpmnFileQuery implements MiranumCopilotQuery {
    public readonly type = "BpmnFileQuery";

    public readonly bpmnFiles: BpmnFile[];

    constructor(bpmnFiles: BpmnFile[]) {
        this.bpmnFiles = bpmnFiles;
    }
}

export class AiResponseQuery implements MiranumCopilotQuery {
    public readonly type = "AiResponseQuery";

    public readonly response: string;

    constructor(response: string) {
        this.response = response;
    }
}
