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

export class BpmnFile {
    public readonly fileName: string;

    public readonly workspaceName: string;

    constructor(fileName: string, workspaceName: string) {
        this.fileName = fileName;
        this.workspaceName = workspaceName;
    }
}
