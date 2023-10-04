import {workspace} from "vscode";
import {ChatCompletionFunctions, Configuration, CreateChatCompletionRequestFunctionCall, OpenAIApi} from "openai";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum,} from "openai/api";

export let openAiApi = new OpenAIApi(getOpenAiConf());

workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("miranum-ide.copilot.openaikey")) {
        openAiApi = new OpenAIApi(getOpenAiConf());
    }
});

function getOpenAiConf(): Configuration {
    const apiKey = workspace
        .getConfiguration("miranum-ide.copilot")
        .get<string>("openaikey");

    return new Configuration({
        apiKey,
    });
}

export async function getCompletion(
    prompt: string,
    model = "gpt-3.5-turbo",
): Promise<string> {
    const messages: ChatCompletionRequestMessage[] = [
        {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: prompt,
        },
    ];
    const response = await openAiApi.createChatCompletion({
        model,
        messages,
        temperature: 0,
    });

    const returnVal = response.data.choices[0].message?.content;
    if (returnVal) {
        return returnVal;
    } else {
        return "";
    }
}

export async function getCompletionWithSchema(
    prompt: string,
    schema: JSON,
    model = "gpt-3.5-turbo"
): Promise<string> {
    const messages: ChatCompletionRequestMessage[] = [
        {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: "You are a helpful process documentation assistant."
        },
        {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: prompt
        }
    ];
    const functions: ChatCompletionFunctions[] = [{
        name: "set_documentation",
        parameters: schema
    }];
    const function_call: CreateChatCompletionRequestFunctionCall = {
        name: "set_documentation"
    };

    const response = await openAiApi.createChatCompletion({
        model,
        messages,
        functions,
        function_call
    });

    const returnVal = response.data.choices[0].message?.function_call?.arguments;
    if (returnVal) {
        return returnVal;
    } else {
        return "{}";
    }
}
