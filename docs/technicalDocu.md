# Miranum Copilot

We use a [Webview](https://code.visualstudio.com/api/extension-guides/webview) to display a custom view within VS Code.
A Webview is an `iframe` within VS Code that is controlled by the extension.
It allows you to create the user interface using standard HTML, CSS and JavaScript.
You can think of a Webview as the Frontend and the Extension as the Backend.
The communication between the two components is implemented in VS Code and uses message passing.
At the moment we are using the GPT model of OpenAI.

![copilot](https://www.plantuml.com/plantuml/proxy?cache=no&src=https://github.com/Miragon/miranum-copilot/blob/83136ba234c5087ed5cf9cf0ed671cb010617165/docs/uml/Copilot.puml?raw=true)

![copilot-detailed](https://www.plantuml.com/plantuml/proxy?cache=no&src=https://github.com/Miragon/miranum-copilot/blob/83136ba234c5087ed5cf9cf0ed671cb010617165/docs/uml/CopilotDetailed.puml?raw=true)

### Communication
Since the Extension and its Webview are in the same project we can share types between them.
1. To differentiate between messages we use the enum `MessageType`.
   ```typescript
   export enum MessageType {
      initialize = "initialize",
      restore = "restore",
      msgFromExtension = "msgFromExtension",
      msgFromWebview = "msgFromWebview",
      info = "info",
      error = "error",
   }
   ```
   * *_Initialize_*: Send by the Webview to inform the Extension that it is fully loaded.
     > Note: The webview cannot process messages from the extension until it is fully loaded.
   * *_Restore_*: Send by the Webview to inform the Extension that it is fully restored.
     > Note: A webview will be destroyed if it is moved to the background by switching the tab.
   * *_MsgFromExtension_* and *_MsgFromWebview_*: Are used to send data between the two components.
     > E.g.: The user's prompt and the LLM's response.
   * *_Info_* and *_Error_*: Are sent from the webview and contain messages that are logged.
2. The data we send within the messages need to be JSON serializable. 
   To Commit to a certain data structure we use the interface `VscMessage`.
   ```typescript
   export interface VscMessage<T> {
      type: string;
      data?: T;
      logger?: string;
   }
   ```

#### Extension
* To listen for messages from the webview, we need to create an EventListener by calling `this.panel.webview.onDidReceiveMessage()`.
* For sending messages to the webview we call `this.panel.webview.postMessage()`.
```typescript
import {WebviewPanel, Uri} from "vscode";
import {VscMessage, MessageType} from "./types";

class CopilotPanel {
   private readonly panel: WebviewPanel;

   private constructor(panel: WebviewPanel, extensionUri: Uri) {
      this.panel = panel;
      this.panel.webview.onDidReceiveMessage(
         async (message: VscMessage<string>) => {
            try {
               switch (message.type) {
                  // ...
               }
            } catch (error) {
               // ...
            }
         });
   }

   private async postMessage(messageType: MessageType, data?: string) {
      const message: VscMessage<string> = {
         type: `${CopilotPanel.viewType}.${messageType}`,
         data,
      };

      const res: boolean = await this.panel.webview.postMessage(message);

      if (!res) {
         Logger.error(
            "[Miranum.Copilot]",
            `(Webview: ${this.panel.title})`,
            `Could not post message (Viewtype: ${this.panel.visible})`
         );
      }
   }
}
```

#### Webview
* To listen for messages from the extension, we need to create an EventListener by calling `window.addEventListener()`.
* For sending messages to the extension we need a special VS Code API object.
  We get this object by calling `acquireVsCodeApi().`
  The type definition of that object is imported from [@types/vscode-webview](https://www.npmjs.com/package/@types/vscode-webview)
  Finally we call the provided `postMessage()` for sending messages to the extension.
```typescript
import {MessageType, VscMessage} from "./types";
import {StateController} from "./StateController";

const stateController = new StateController();

window.addEventListener("message", receiveMessage);

function receiveMessage(message: MessageEvent<VscMessage<string>>): void {
   try {
      const type = message.data.type;
      const data = message.data.data;

      switch (type) {
              // ...
      }
   } catch (error) {
      // ...
   }
}

function postMessage(type: MessageType, data?: string, info?: string): void {
   switch (type) {
      case MessageType.msgFromWebview: {
         stateController.postMessage({
            type: `${globalViewType}.${type}`,
            data: data ? data : "",
         });
         break;
      }
      default: {
         stateController.postMessage({
            type: `${globalViewType}.${type}`,
            logger: info,
         });
         break;
      }
   }
}
```

```typescript
import {WebviewApi} from "vscode-webview";
import {VscMessage} from "./types";

export class StateController {
   private vscode: WebviewApi<VscState<JSON>>;

   constructor() {
      this.vscode = acquireVsCodeApi();
   }

   public postMessage(message: VscMessage<string>) {
      this.vscode.postMessage(message);
   }

   //...
}
```

### OpenAI API
At the moment we only use the LLM models from OpenAI.
We use the OpenAI API to fetch the response from the LLM.
1. The API Key is stored locally and can be added within the settings of VS Code.
   To display custom settings an entry in the `package.json` is required.
   To retrieve the key we call `workspace.getConfiguration()`.
2. To enrich the prompt with information about the currently open BPMN process or form, an
   interface to the corresponding `Miranum-Extensions` is required.
   How to provide such an interface is explained [here](https://github.com/peterhnm/vscode-mock-text-editor).
   To use the provided API we have to define the dependency within the `package.json`.
   Inside the code we get access to the API by calling `extensions.getExtension(EXTENSION_ID)`.
3. We use the `createChatCompletion()`-Method provided by the [OpenAI npm package](https://www.npmjs.com/package/openai).
   For more detailed documentation of the API, we recommend visiting the official [API Reference](https://platform.openai.com/docs/api-reference/introduction).
```json
{
  /* ... */
  /* Dependencies to other extensions */
  "extensionDependencies": [
    "miragon-gmbh.vs-code-bpmn-modeler"
  ],
  /* Custom Settings */
  "contributes": {
    "configuration": {
      "title": "MiranumCopilot",
      "properties": {
        "miranum.copilot.openaikey": {
          "scope": "application",
          "type": "string",
          "description": "Enter your Open AI API Key",
          "pattern": "sk-.*"
        }
      }
    }
  }
  /* ... */
}
```
```typescript
import {extensions} from "vscode";
import {Configuration, OpenAIApi} from "openai";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai/api";

const OPEN_AI_KEY = workspace.getConfiguration("miranum.copilot").get<string>("openaikey");
const configuration = new Configuration({
  apiKey: OPEN_AI_KEY,
});

class CopilotPanel {

  private bpmnModeler = extensions.getExtension("miragon-gmbh.vs-code-bpmn-modeler")?.exports;

  private openai = new OpenAIApi(configuration);

  private async getResponseFromApi(prompt?: string): Promise<string> {
    if (!prompt) {
      throw Error("No prompt given!");
    }

    try {
      return await this.getCompletion(prompt);
    } catch (error) {
      throw Error("Error while fetching data from OpenAI");
    }
  }

  private async getCompletion(
          prompt: string,
          model = "gpt-3.5-turbo"
  ): Promise<string> {
    const content = this.createCompletion(prompt);
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content,
      },
    ];
    const response = await this.openai.createChatCompletion({
      model,
      messages,
      temperature: 0,
    });

    if (
            response.data.choices[0].message &&
            response.data.choices[0].message.content
    ) {
      return response.data.choices[0].message.content;
    } else {
      return "";
    }
  }
}
```
