import { extensions, workspace } from "vscode";
import { Configuration, OpenAIApi } from "openai";
import {
    ChatCompletionRequestMessage,
    ChatCompletionRequestMessageRoleEnum,
} from "openai/api";

export let openAiApi = new OpenAIApi(getOpenAiConf());

const bpmnModeler = extensions.getExtension("miragon-gmbh.vs-code-bpmn-modeler")
    ?.exports;

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
    const content = createCompletion(prompt);
    const messages: ChatCompletionRequestMessage[] = [
        {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content,
        },
    ];
    const response = await openAiApi.createChatCompletion({
        model,
        messages,
        temperature: 0,
    });

    if (response.data.choices[0].message && response.data.choices[0].message.content) {
        return response.data.choices[0].message.content;
    } else {
        return "";
    }
}

function createCompletion(prompt: string): string {
    return `
${prompt}
The BPMN Process is delimited by triple quotes.

'''${bpmnModeler.getBpmn()}'''
        `;
}
