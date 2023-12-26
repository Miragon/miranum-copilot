import {
    BpmnFileQuery,
    CreateProcessDocumentationCommand,
    PromptQuery,
    TemplateQuery,
} from "../shared";
import { CreateOrShowWebviewInPort, CreateProcessDocumentationInPort } from "./ports/in";
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
import { BpmnFile, PromptCreation } from "./model";

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

    async sendTemplates(): Promise<boolean> {
        const templateQuery = new TemplateQuery(
            await this.getTemplatesOutPort.getTemplates(),
        );
        return this.postMessageOutPort.postMessage(templateQuery);
    }

    async sendPrompts(): Promise<boolean> {
        const promptQuery = new PromptQuery(await this.getPromptsOutPort.getPrompts());
        return this.postMessageOutPort.postMessage(promptQuery);
    }

    async sendBpmnFiles(): Promise<boolean> {
        const bpmnFiles: BpmnFile[] = await this.getBpmnFilesOutPort.getBpmnFiles();
        const bpmnFilesSorted = BpmnFile.sortByWorkspaceName(bpmnFiles);
        const bpmnFileQuery = new BpmnFileQuery(bpmnFilesSorted);
        return this.postMessageOutPort.postMessage(bpmnFileQuery);
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
        createProcessDocumentationCommand: CreateProcessDocumentationCommand,
    ): Promise<boolean> {
        const { bpmnFilePath, template } = createProcessDocumentationCommand;

        // 1. Read process description from bpmn file
        const bpmnFile = await this.readFileOutPort.readFile(bpmnFilePath);
        const processDescription = bpmnFile.match(
            /<bpmn:process[\s\S]*<\/bpmn:process>/,
        );

        if (!processDescription) {
            // FIXME: show error message and return false
            throw new Error(`No bpmn process found in file ${bpmnFilePath}`);
        }

        // 2. Read documentation template
        const templateFile = await this.readFileOutPort.readFile(template.path);

        // 3. Create the prompt
        const promptCreation = new PromptCreation({
            base: templateFile,
            process: processDescription[0],
            template: templateFile,
        });

        // 4. Get AI response
        const res = await this.getAiResponseOutPort.getAiResponse(promptCreation);

        // 5. Create process documentation file
        // FIXME: fix filename
        return this.createFileOutPort.createFile("documentation", res);
    }
}
