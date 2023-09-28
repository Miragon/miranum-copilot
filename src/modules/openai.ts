import { extensions, Uri, workspace } from "vscode";
import { Configuration, OpenAIApi } from "openai";
import {
    ChatCompletionRequestMessage,
    ChatCompletionRequestMessageRoleEnum,
} from "openai/api";
import { OutputFormat, Prompt } from "../shared/types";
import { readFile } from "./reader";

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
    extensionUri: Uri,
    prompt: string,
    model = "gpt-3.5-turbo",
): Promise<string> {
    const promptObject = JSON.parse(prompt);
    const content = await createCompletion(promptObject, extensionUri);
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

async function createCompletion(prompt: Prompt, extensionUri: Uri): Promise<string> {
    let returnValue = prompt.text;

    if (prompt.process) {
        returnValue =
            returnValue +
            "\n\n" +
            "The BPMN Process is delimited by triple quotes." +
            "\n\n" +
            "'''" +
            bpmnModeler.getBpmn() +
            "'''";
    }
    if (prompt.form) {
        // returnValue =
        //     returnValue +
        //     "\n\n" +
        //     "The Form is delimited by triple equal signs." +
        //     "\n\n" +
        //     "===" +
        //     formBuilder.getForm() +
        //     "===";
    }
    if (prompt.template) {
        returnValue =
            returnValue +
            "\n\n" +
            "The Template is delimited by triple asterisks." +
            "\n\n" +
            "***" +
            (await getTemplate(prompt, extensionUri)) +
            "***";
    }

    return returnValue;
}

async function getTemplate(prompt: Prompt, extensionUri: Uri): Promise<string> {
    if (!prompt.template) {
        throw new Error("No template specified");
    }

    let uri;
    if (typeof prompt.template === "boolean") {
        switch (prompt.outputFormat) {
            case OutputFormat.json:
                uri = Uri.joinPath(
                    extensionUri,
                    "resources",
                    "templates",
                    "documentation.schema.json",
                );
                break;
            case OutputFormat.md:
            default:
                uri = Uri.joinPath(
                    extensionUri,
                    "resources",
                    "templates",
                    "documentation.md",
                );
                break;
        }
    } else {
        uri = Uri.file(prompt.template);
    }

    if (!uri) {
        throw new Error("Something went wrong while creating the uri!");
    }

    return await readFile(uri);
}
