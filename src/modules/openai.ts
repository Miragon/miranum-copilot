import { window, workspace } from "vscode";
import OpenAI from "openai";
import {
    ChatCompletionCreateParams,
    ChatCompletionMessageParam,
} from "openai/resources/chat";

export let openAiApi = new OpenAI({ apiKey: getApiKey() });

workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("miranum-ide.copilot.openaikey")) {
        openAiApi = new OpenAI({ apiKey: getApiKey() });
    }
});

function getApiKey(): string {
    const apiKey = workspace
        .getConfiguration("miranum-ide.copilot")
        .get<string>("openaikey");

    if (!apiKey) {
        window.showErrorMessage("OpenAI key not found");
        throw new Error("OpenAI key not found");
    }

    return apiKey;
}

export async function getCompletion(
    prompt: string,
    model = "gpt-3.5-turbo",
): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
        {
            role: "user",
            content: prompt,
        },
    ];
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

export async function getCompletionWithSchema(
    prompt: string,
    schema: JSON,
    model = "gpt-3.5-turbo",
): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "You are a helpful process documentation assistant.",
        },
        {
            role: "user",
            content: prompt,
        },
    ];
    const functions: ChatCompletionCreateParams.Function[] = [
        {
            name: "set_documentation",
            parameters: {
                ...schema,
            },
        },
    ];
    const function_call: ChatCompletionCreateParams.FunctionCallOption = {
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
