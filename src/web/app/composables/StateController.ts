import { WebviewApi } from "vscode-webview";
import { VscMessage, VscState } from "../../../shared/types";
import { VsCode } from "@/composables/types";

export class StateController implements VsCode {
    private vscode: WebviewApi<VscState<string>>;

    constructor() {
        this.vscode = acquireVsCodeApi();
    }

    public getState(): VscState<string> | undefined {
        return this.vscode.getState();
    }

    public setState(state: VscState<string>) {
        this.vscode.setState(state);
    }

    public updateState(state: VscState<string>) {
        this.setState({
            ...state,
        });
    }

    public postMessage(message: VscMessage<string>) {
        this.vscode.postMessage(message);
    }
}
