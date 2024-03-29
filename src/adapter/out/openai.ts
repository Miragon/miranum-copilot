import { GetAiResponseOutPort, ShowProgressOutPort } from "../../application/ports/out";
import OpenAI from "openai";
import { window, workspace } from "vscode";
import {
    ChatCompletionCreateParams,
    ChatCompletionFunctionCallOption,
    ChatCompletionMessageParam,
} from "openai/resources/chat";
import { PromptCreation } from "../../application/model";
import { inject, singleton } from "tsyringe";

@singleton()
export class OpenAIApiAdapter implements GetAiResponseOutPort {
    constructor(
        @inject("ShowProgressOutPort")
        private readonly showProgressOutPort: ShowProgressOutPort,
    ) {}

    getAiResponse(prompt: PromptCreation): Promise<string> {
        const messages: ChatCompletionMessageParam[] = [
            {
                role: "user",
                content: prompt.createPrompt(),
            },
        ];

        const completion = getCompletion(messages);

        return this.showProgressOutPort.showProgress(
            "Miranum Copilot",
            "Generating...",
            completion,
        );
    }

    getProcessDocumentation(
        prompt: PromptCreation,
        fileFormat: string,
    ): Promise<string> {
        const model = "gpt-4";

        if (fileFormat === "json") {
            const messages: ChatCompletionMessageParam[] = [
                {
                    role: "system",
                    content: "You are a helpful process documentation assistant.",
                },
                {
                    role: "user",
                    content: prompt.createPrompt(),
                },
            ];
            return getCompletionWithParameter(
                messages,
                prompt.getTemplateAsJson(),
                model,
            );
        } else if (fileFormat === "md") {
            const messages: ChatCompletionMessageParam[] = [
                {
                    role: "system",
                    content: "You are a helpful process documentation assistant.",
                },
                {
                    role: "user",
                    content: prompt.createPrompt(),
                },
            ];
            const completion = getCompletion(messages, model);

            return this.showProgressOutPort.showProgress(
                "Create Documentation",
                "Generating...",
                completion,
            );
        } else {
            throw new Error(`File format ${fileFormat} not supported`);
        }
    }

    getForm(prompt: PromptCreation): Promise<string> {
        const model = "gpt-4";
        const messages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: "You are a helpful JSON Forms builder.",
            },
            {
                role: "user",
                content: prompt.createPrompt(),
            },
        ];

        const completion = getCompletionWithParameter(
            messages,
            prompt.getTemplateAsJson(),
            model,
        );

        return this.showProgressOutPort.showProgress(
            "Create Form",
            "Generating...",
            completion,
        );
    }
}

let openAiApi = new OpenAI({ apiKey: getApiKey() });

workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("miranumIDE.copilot.openaiApiKey")) {
        openAiApi = new OpenAI({ apiKey: getApiKey() });
    }
});

function getApiKey(): string {
    const apiKey = workspace
        .getConfiguration("miranumIDE.copilot")
        .get<string>("openaiApiKey");

    if (!apiKey) {
        window.showErrorMessage("OpenAI key not found");
        throw new Error("OpenAI key not found");
    }

    return apiKey;
}

async function getCompletion(
    messages: ChatCompletionMessageParam[],
    model = "gpt-3.5-turbo",
): Promise<string> {
    const response = await openAiApi.chat.completions.create({
        model,
        messages,
        temperature: 0,
    });

    const returnVal = response.choices[0].message?.content;
    if (returnVal) {
        return returnVal;
    } else {
        return "";
    }
}

async function getCompletionWithParameter(
    messages: ChatCompletionMessageParam[],
    schema: JSON,
    model = "gpt-3.5-turbo",
): Promise<string> {
    const functions: ChatCompletionCreateParams.Function[] = [
        {
            name: "set_documentation",
            parameters: {
                ...schema,
            },
        },
    ];
    const function_call: ChatCompletionFunctionCallOption = {
        name: "set_documentation",
    };

    const response = await openAiApi.chat.completions.create({
        model,
        messages,
        functions,
        function_call,
    });

    const returnVal = response.choices[0].message?.function_call?.arguments;
    if (returnVal) {
        return returnVal;
    } else {
        return "{}";
    }
}
