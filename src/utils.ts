import { ExtensionContext } from "vscode";
import { singleton } from "tsyringe";

// eslint-disable-next-line @typescript-eslint/naming-convention
@singleton()
export class ExtensionContextHelper {
    private _context?: ExtensionContext;

    get context(): ExtensionContext {
        if (!this._context) {
            throw new Error("ExtensionContext is not set");
        }
        return this._context;
    }

    set context(context: ExtensionContext) {
        this._context = context;
    }
}

// export class EXTENSION_CONTEXT {
//     private static instance: EXTENSION_CONTEXT;
//
//     private static context: ExtensionContext;
//
//     private constructor(context: ExtensionContext) {
//         EXTENSION_CONTEXT.context = context;
//     }
//
//     public static setContext(context: ExtensionContext): EXTENSION_CONTEXT {
//         if (this.instance) {
//             throw new Error("ExtensionUri is already set");
//         }
//         this.instance = new EXTENSION_CONTEXT(context);
//         return this.instance;
//     }
//
//     public static getContext(): ExtensionContext {
//         if (!this.instance) {
//             throw new Error("ExtensionUri is not set");
//         }
//         return EXTENSION_CONTEXT.context;
//     }
// }
