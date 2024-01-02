import { inject, singleton } from "tsyringe";

import {
    CreateFormInPort,
    CreateOrShowUiInPort,
    CreateProcessDocumentationInPort,
    GetBpmnFilesInPort,
    GetPromptsInPort,
    GetTemplatesInPort,
    SendAiResponseInPort,
    SendToUiInPort,
} from "./ports/in";
import {
    CreateDocumentationDialogOutPort,
    CreateFileOutPort,
    CreateFormOutPort,
    CreateOrShowUiOutPort,
    GetAiResponseOutPort,
    GetBpmnFilesOutPort,
    GetPromptsOutPort,
    GetTemplatesOutPort,
    PostMessageOutPort,
    ReadFileOutPort,
    ShowMessageOutPort,
    ShowProgressOutPort,
} from "./ports/out";
import {
    BpmnFile,
    DefaultPrompt,
    DocumentationExtension,
    PromptCreation,
    Template,
} from "./model";
import {
    documentationJsonPrompt,
    documentationMarkdownPrompt,
} from "./promptCollection";

@singleton()
export class CreateOrShowWebviewUseCase implements CreateOrShowUiInPort {
    constructor(
        @inject("CreateOrShowUiOutPort")
        private readonly createOrShowUiOutPort: CreateOrShowUiOutPort,
    ) {}

    createOrShowWebview(): string {
        return this.createOrShowUiOutPort.createOrShowWebview();
    }
}

@singleton()
export class GetBpmnFilesUseCase implements GetBpmnFilesInPort {
    constructor(
        @inject("GetBpmnFilesOutPort")
        private readonly getBpmnFilesOutPort: GetBpmnFilesOutPort,
    ) {}

    async getBpmnFiles(): Promise<BpmnFile[]> {
        const bpmnFiles = await this.getBpmnFilesOutPort.getBpmnFiles();
        return BpmnFile.sortByWorkspaceName(bpmnFiles);
    }
}

@singleton()
export class GetPromptsUseCase implements GetPromptsInPort {
    constructor(
        @inject("GetPromptsOutPort")
        private readonly getPromptsOutPort: GetPromptsOutPort,
    ) {}

    async getPrompts(): Promise<Map<string, DefaultPrompt[]>> {
        return this.getPromptsOutPort.getPrompts();
    }
}

@singleton()
export class GetTemplatesUseCase implements GetTemplatesInPort {
    constructor(
        @inject("GetTemplatesOutPort")
        private readonly getTemplatesOutPort: GetTemplatesOutPort,
    ) {}

    async getTemplates(): Promise<Map<string, Template[]>> {
        return this.getTemplatesOutPort.getTemplates();
    }
}

@singleton()
export class SendToUiUseCase implements SendToUiInPort {
    constructor(
        @inject("PostMessageOutPort")
        private readonly postMessageOutPort: PostMessageOutPort,
    ) {}

    sendBpmnFiles(bpmnFiles: BpmnFile[]): Promise<boolean> {
        return this.postMessageOutPort.sendBpmnFiles(bpmnFiles);
    }

    sendPrompts(prompts: Map<string, DefaultPrompt[]>): Promise<boolean> {
        return this.postMessageOutPort.sendPrompts(prompts);
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
        @inject("CreateDocumentationDialogOutPort")
        private readonly createDocumentationDialogOutPort: CreateDocumentationDialogOutPort,
        @inject("ShowMessageOutPort")
        private readonly showMessageOutPort: ShowMessageOutPort,
        @inject("ShowProgressOutPort")
        private readonly showProgressOutPort: ShowProgressOutPort,
    ) {}

    async createProcessDocumentation(
        bpmnFiles: BpmnFile[],
        templates: Template[],
    ): Promise<boolean> {
        try {
            // 1. Get the bpmn file content
            const bpmnFile =
                await this.createDocumentationDialogOutPort.getBpmnFile(bpmnFiles);
            const bpmn = this.readFileOutPort.readFile(bpmnFile.fullPath);

            // 2. Get the file format
            const format = await this.createDocumentationDialogOutPort.getFormat();
            const documentationExtension = new DocumentationExtension(format);
            // TODO: Depending on the format, filter the templates

            // 3. Read documentation template
            const template =
                await this.createDocumentationDialogOutPort.getTemplate(templates);
            const documentationTemplate = this.readFileOutPort.readFile(template.path);

            // 4. Get file name
            const fileName = await this.createDocumentationDialogOutPort.getName();

            // 5. Create the prompt
            const processDescription = (await bpmn).match(
                /<bpmn:process[\s\S]*<\/bpmn:process>/,
            );

            if (!processDescription) {
                // FIXME: show error message and return false
                throw new Error(`No bpmn process found in file ${bpmnFile.fullPath}`);
            }

            const base =
                format === "md" ? documentationMarkdownPrompt : documentationJsonPrompt;
            const promptCreation = new PromptCreation({
                base,
                process: processDescription[0],
                template: await documentationTemplate,
            });

            // 6. Get AI response
            const res = await this.getAiResponseOutPort.getProcessDocumentation(
                promptCreation,
                documentationExtension.extension,
            );

            // 7. Create process documentation file
            await this.createFileOutPort.createFile(
                fileName,
                documentationExtension,
                res,
                bpmnFile.workspaceName,
            );

            // 6. Show a message to user
            return this.showMessageOutPort.showInformationMessage(
                "Documentation created!",
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Error while creating documentation!";
            return this.showMessageOutPort.showErrorMessage(errorMessage);
        }
    }
}

@singleton()
export class CreateFormUseCase implements CreateFormInPort {
    constructor(
        @inject("CreateFormOutPort")
        private readonly createFormOutPort: CreateFormOutPort,
        @inject("ReadFileOutPort") private readonly readFileOutPort: ReadFileOutPort,
        @inject("CreateFileOutPort")
        private readonly createFileOutPort: CreateFileOutPort,
        @inject("GetAiResponseOutPort")
        private readonly getAiResponseOutPort: GetAiResponseOutPort,
        @inject("ShowMessageOutPort")
        private readonly showMessageOutPort: ShowMessageOutPort,
    ) {}

    async createForm(templates: Template[]): Promise<boolean> {
        try {
            // 1. Get the fields
            const fields = await this.createFormOutPort.getFields();

            // 2. Get the file format
            const format = await this.createFormOutPort.getFormat();
            const formExtension = new DocumentationExtension(format);

            // 3. Read form template
            const template = await this.createFormOutPort.getTemplate(templates);
            const formTemplate = await this.readFileOutPort.readFile(template.path);

            // 4. Get file name
            const fileName = await this.createFormOutPort.getName();

            // 5. Create the prompt

            // 6. Get AI response

            // 7. Show a message to user
            return this.showMessageOutPort.showInformationMessage("Form created!");
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Error while creating form!";
            return this.showMessageOutPort.showErrorMessage(errorMessage);
        }
    }
}

@singleton()
export class SendAiResponseUseCase implements SendAiResponseInPort {
    constructor(
        @inject("ReadFileOutPort") private readonly readFileOutPort: ReadFileOutPort,
        @inject("GetAiResponseOutPort")
        private readonly getAiResponseOutPort: GetAiResponseOutPort,
        @inject("PostMessageOutPort")
        private readonly postMessageOutPort: PostMessageOutPort,
    ) {}

    async sendAiResponse(prompt: PromptCreation, bpmnFile?: BpmnFile): Promise<boolean> {
        if (bpmnFile) {
            const bpmn = await this.readFileOutPort.readFile(bpmnFile.fullPath);
            const process = bpmn.match(/<bpmn:process[\s\S]*<\/bpmn:process>/);

            if (!process) {
                // FIXME: show error message and return false
                throw new Error(`No bpmn process found in file ${bpmnFile.fullPath}`);
            }

            prompt.setProcess(process[0]);
        }
        const res = await this.getAiResponseOutPort.getAiResponse(prompt);
        return this.postMessageOutPort.sendAiResponse(res);
    }
}
