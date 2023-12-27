import {
    CreateFormInPort,
    CreateOrShowWebviewInPort,
    CreateProcessDocumentationInPort,
} from "./ports/in";
import {
    CreateFileOutPort,
    CreateOrShowWebviewOutPort,
    GetAiResponseOutPort,
    GetBpmnFilesOutPort,
    GetPromptsOutPort,
    GetTemplatesOutPort,
    PostMessageOutPort,
    ReadFileOutPort,
} from "./ports/out";
import { inject, singleton } from "tsyringe";
import { BpmnFile, DocumentationFormat, PromptCreation, Template } from "./model";

@singleton()
export class CreateOrShowWebviewUseCase implements CreateOrShowWebviewInPort {
    constructor(
        @inject("CreateOrShowWebviewOutPort")
        private readonly createOrShowWebviewOutPort: CreateOrShowWebviewOutPort,
        @inject("GetTemplatesOutPort")
        private readonly getTemplatesOutPort: GetTemplatesOutPort,
        @inject("GetPromptsOutPort")
        private readonly getPromptsOutPort: GetPromptsOutPort,
        @inject("GetBpmnFilesOutPort")
        private readonly getBpmnFilesOutPort: GetBpmnFilesOutPort,
        @inject("PostMessageOutPort")
        private readonly postMessageOutPort: PostMessageOutPort,
    ) {}

    createOrShowWebview(): string {
        return this.createOrShowWebviewOutPort.createOrShowWebview();
    }

    async sendBpmnFiles(): Promise<boolean> {
        const bpmnFiles = await this.getBpmnFilesOutPort.getBpmnFiles();
        const bpmnFilesSorted = BpmnFile.sortByWorkspaceName(bpmnFiles);
        return this.postMessageOutPort.sendBpmnFiles(bpmnFilesSorted);
    }

    async sendPrompts(): Promise<boolean> {
        const prompts = await this.getPromptsOutPort.getPrompts();
        return this.postMessageOutPort.sendPrompts(prompts);
    }

    async sendTemplates(): Promise<boolean> {
        const templates = await this.getTemplatesOutPort.getTemplates();
        return this.postMessageOutPort.sendTemplates(templates);
    }
}

@singleton()
export class CreateProcessDocumentationUseCase
implements CreateProcessDocumentationInPort
{
    constructor(
        @inject("ReadFileOutPort") private readonly readFileOutPort: ReadFileOutPort,
        @inject("CreateFileOutPort")
        private readonly createFileOutPort: CreateFileOutPort,
        @inject("GetAiResponseOutPort")
        private readonly getAiResponseOutPort: GetAiResponseOutPort,
    ) {}

    async createProcessDocumentation(
        fileName: string,
        bpmnFilePath: string,
        template: Template,
        fileFormat: DocumentationFormat,
    ): Promise<boolean> {
        // 1. Read the bpmn file and extract the process description
        const bpmnFile = await this.readFileOutPort.readFile(bpmnFilePath);
        const processDescription = bpmnFile.match(
            /<bpmn:process[\s\S]*<\/bpmn:process>/,
        );

        if (!processDescription) {
            // FIXME: show error message and return false
            throw new Error(`No bpmn process found in file ${bpmnFilePath}`);
        }

        // 2. Read documentation template
        const documentationTemplate = await this.readFileOutPort.readFile(template.path);

        // 3. Create the prompt
        const promptCreation = new PromptCreation({
            base: documentationTemplate,
            process: processDescription[0],
            template: documentationTemplate,
        });

        // 4. Get AI response
        const res = await this.getAiResponseOutPort.getProcessDocumentation(
            promptCreation,
            fileFormat,
        );

        // 5. Create process documentation file
        return this.createFileOutPort.createFile(fileName, res);
    }
}

@singleton()
export class CreateFormUseCase implements CreateFormInPort {
    constructor(
        @inject("ReadFileOutPort") private readonly readFileOutPort: ReadFileOutPort,
        @inject("CreateFileOutPort")
        private readonly createFileOutPort: CreateFileOutPort,
        @inject("GetAiResponseOutPort")
        private readonly getAiResponseOutPort: GetAiResponseOutPort,
    ) {}

    async createForm(
        fileName: string,
        prompt: PromptCreation,
        template: FormTemplate,
    ): Promise<boolean> {
        // 1. Read form template
        const formTemplate = await this.readFileOutPort.readFile(template.path);

        // 2. Create the prompt
        prompt.setTemplate(formTemplate);

        // 3. Get AI response
        const res = await this.getAiResponseOutPort.getForm(prompt);

        // 4. Create form file
        return this.createFileOutPort.createFile(fileName, res);
    }
}
