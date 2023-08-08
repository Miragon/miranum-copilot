import { VscMessage, VscState } from "../../../shared/types";

export interface VsCode {
    getState(): VscState<string> | undefined;

    setState(state: VscState<string>): void;

    updateState(state: VscState<string>): void;

    postMessage(message: VscMessage<string>): void;
}
