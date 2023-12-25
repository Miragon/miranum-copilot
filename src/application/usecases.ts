import { CreateProcessDocumentationCommand } from "../shared";
import { CreateOrShowWebviewInPort, CreateProcessDocumentationInPort } from "./ports/in";
import {
    CreateFileOutPort,
    CreateOrShowWebviewOutPort,
    GetBpmnFilesOutPort,
    GetPromptsOutPort,
    SendBpmnFilesOutPort,
    SendPromptsOutPort,
} from "./ports/out";
import { inject, singleton } from "tsyringe";

@singleton()
export class CreateOrShowWebviewUseCase implements CreateOrShowWebviewInPort {
    constructor(
        @inject("CreateOrShowWebviewOutPort")
        private readonly createOrShowWebviewOutPort: CreateOrShowWebviewOutPort,
        @inject("GetPromptsOutPort")
        private readonly getPromptsOutPort: GetPromptsOutPort,
        @inject("GetBpmnFilesOutPort")
        private readonly getBpmnFilesOutPort: GetBpmnFilesOutPort,
        @inject("SendPromptsOutPort")
        private readonly sendPromptsOutPort: SendPromptsOutPort,
        @inject("SendBpmnFilesOutPort")
        private readonly sendBpmnFilesOutPort: SendBpmnFilesOutPort,
    ) {}

    createOrShowWebview(): string {
        return this.createOrShowWebviewOutPort.createOrShowWebview();
    }

    async sendPrompts(): Promise<boolean> {
        return this.sendPromptsOutPort.sendPrompts(
            await this.getPromptsOutPort.getPrompts(),
        );
    }

    async sendBpmnFiles(): Promise<boolean> {
        return this.sendBpmnFilesOutPort.sendBpmnFiles(
            await this.getBpmnFilesOutPort.getBpmnFiles(),
        );
    }
}

@singleton()
export class CreateProcessDocumentationUseCase
implements CreateProcessDocumentationInPort
{
    constructor(
        @inject("CreateFileOutPort")
        private readonly createFileOutPort: CreateFileOutPort,
    ) {}

    createProcessDocumentation(
        createProcessDocumentationCommand: CreateProcessDocumentationCommand,
    ): Promise<boolean> {
        const [bpmnFilePath, templatePath, templateFormat] =
            createProcessDocumentationCommand;
    }
}
