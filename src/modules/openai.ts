import { window, workspace } from "vscode";
import OpenAI from "openai";
import {
    ChatCompletionCreateParams,
    ChatCompletionMessageParam,
} from "openai/resources/chat";
import fs from "fs"; //imports .from
import path from "path"; //imports .from

//*** JSON Schema .form*/
export async function fillFormWithGPT3(formFilePath: string): Promise<void> {
    // Read the form file
    const formContent = fs.readFileSync(formFilePath, "utf-8");
    const formJson = JSON.parse(formContent);

    // Define the prompts based on the form fields
    const prompts = {
        Vorname: "Please provide a common first name.",
        Nachname: "Please provide a common last name.",
        Adresse: "Please provide an example address.",
        Datum: "Please provide the current date.",
    };

    // Iterate over each field in the form and get GPT-3 to generate content
    for (const field in formJson) {
        if (prompts[field]) {
            try {
                // Use GPT-3 to generate content for the field
                const prompt = prompts[field];
                const response: Completion = await openAiApi.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: prompt,
                        },
                    ],
                });

                // Use the GPT-3 response to fill in the form field
                formJson[field] = response.choices[0]?.message?.content || "";
            } catch (error) {
                console.error(`Failed to generate content for field ${field}:`, error);
            }
        }
    }

    // Save the modified form back to a file
    const modifiedFormContent = JSON.stringify(formJson, null, 4);
    const modifiedFormFilePath = path.join(
        path.dirname(formFilePath),
        "modified_form.json",
    );
    fs.writeFileSync(modifiedFormFilePath, modifiedFormContent);

    window.showInformationMessage(`Form filled and saved to ${modifiedFormFilePath}`);
} // Example: fillFormWithGPT3("/path/to/your/form.form");

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
