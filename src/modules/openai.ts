import { window, workspace } from "vscode";
import OpenAI from "openai";
import {
    ChatCompletionCreateParams,
    ChatCompletionMessageParam,
} from "openai/resources/chat";

export let openAiApi = new OpenAI({ apiKey: getApiKey() });

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

export async function getCompletion(
    messages: { role: string; content: string }[],
    model = "gpt-3.5-turbo",
): Promise<string> {
    if (!isChatCompletionMessageParam(messages)) {
        throw new Error("[OpenAI] Invalid message");
    }

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
    messages: { role: string; content: string }[],
    schema: JSON,
    model = "gpt-3.5-turbo",
): Promise<string> {
    if (!isChatCompletionMessageParam(messages)) {
        throw new Error("[OpenAI] Invalid message");
    }

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

// function mapMessages(
//     messages: [{ role: string; content: string }],
// ): ChatCompletionMessageParam[] {
//     const msg: ChatCompletionMessageParam[] = messages.map((message) => {
//         if (
//             message.role === "user" ||
//             message.role === "system" ||
//             message.role === "assistant" ||
//             message.role === "function"
//         ) {
//             return {
//                 role: message.role,
//                 content: message.content,
//             };
//         } else {
//             throw new Error("Invalid message");
//         }
//     });
//
//     if (!msg) {
//         throw new Error("Invalid message");
//     }
//
//     return msg;
// }

function isChatCompletionMessageParam(
    message: any,
): message is ChatCompletionMessageParam[] {
    for (const msg of message) {
        if (!("role" in msg) || !("content" in msg)) {
            return false;
        }
        if (
            msg.role !== "user" &&
            msg.role !== "system" &&
            msg.role !== "assistant" &&
            msg.role !== "function"
        ) {
            return false;
        }
    }
    return true;
}
