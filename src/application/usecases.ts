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
    CreateFileOutPort,
    CreateOrShowUiOutPort,
    GetAiResponseOutPort,
    GetBpmnFilesOutPort,
    GetPromptsOutPort,
    GetTemplatesOutPort,
    PostMessageOutPort,
    ReadFileOutPort,
    ShowMessageOutPort,
} from "./ports/out";
import {
    BpmnFile,
    DefaultPrompt,
    DocumentationExtension,
    FormExtension,
    PromptCreation,
    Template,
} from "./model";

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

    async getPrompts(): Promise<DefaultPrompt[]> {
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

    sendPrompts(prompts: DefaultPrompt[]): Promise<boolean> {
        return this.postMessageOutPort.sendPrompts(prompts);
    }

    sendTemplates(templates: Map<string, Template[]>): Promise<boolean> {
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
        @inject("ShowMessageOutPort")
        private readonly showMessageOutPort: ShowMessageOutPort,
    ) {}

    async createProcessDocumentation(
        fileName: string,
        bpmnFile: BpmnFile,
        template: Template,
        fileFormat: DocumentationExtension,
    ): Promise<boolean> {
        try {
            // 1. Read the bpmn file and extract the process description
            const bpmn = await this.readFileOutPort.readFile(bpmnFile.fullPath);
            const processDescription = bpmn.match(
                /<bpmn:process[\s\S]*<\/bpmn:process>/,
            );

            if (!processDescription) {
                // FIXME: show error message and return false
                throw new Error(`No bpmn process found in file ${bpmnFile.fullPath}`);
            }

            // 2. Read documentation template
            const documentationTemplate = await this.readFileOutPort.readFile(
                template.path,
            );

            // 3. Create the prompt
            const promptCreation = new PromptCreation({
                base: documentationTemplate,
                process: processDescription[0],
                template: documentationTemplate,
            });

            // 4. Get AI response
            const res = await this.getAiResponseOutPort.getProcessDocumentation(
                promptCreation,
                fileFormat.extension,
            );

            // 5. Create process documentation file
            await this.createFileOutPort.createFile(
                fileName,
                fileFormat,
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
        @inject("ReadFileOutPort") private readonly readFileOutPort: ReadFileOutPort,
        @inject("CreateFileOutPort")
        private readonly createFileOutPort: CreateFileOutPort,
        @inject("GetAiResponseOutPort")
        private readonly getAiResponseOutPort: GetAiResponseOutPort,
        @inject("ShowMessageOutPort")
        private readonly showMessageOutPort: ShowMessageOutPort,
    ) {}

    async createForm(
        fileName: string,
        prompt: PromptCreation,
        template: Template,
        fileFormat: FormExtension,
    ): Promise<boolean> {
        try {
            // 1. Read form template
            const formTemplate = await this.readFileOutPort.readFile(template.path);

            // 2. Create the prompt
            prompt.setTemplate(formTemplate);

            // 3. Get AI response
            const res = await this.getAiResponseOutPort.getForm(prompt);

            // 4. Create form file
            await this.createFileOutPort.createFile(fileName, fileFormat, res);

            // 5. Show a message to user
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
        @inject("GetAiResponseOutPort")
        private readonly getAiResponseOutPort: GetAiResponseOutPort,
        @inject("PostMessageOutPort")
        private readonly postMessageOutPort: PostMessageOutPort,
    ) {}

    async sendAiResponse(prompt: PromptCreation): Promise<boolean> {
        const res = await this.getAiResponseOutPort.getAiResponse(prompt);
        return this.postMessageOutPort.sendAiResponse(res);
    }
}

@singleton()
export class UpdateWebviewUseCase {}
