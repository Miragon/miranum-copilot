# Development

## Tech-Stack

* [Typescript](https://www.typescriptlang.org/docs/)
* [Vue 3](https://vuejs.org/guide/introduction.html)
* [Vite](https://vitejs.dev/guide/)

## Project structure

```
.
├── package.json
├── tsconfig.json
├── dist                    // the output folder when building the extension
└── src
    ├── shared              // between 'backend' and 'frontend'
    ├── extension.ts
    ├── CopilotPanel.ts
    └── web                 // 'frontend'
        ├── tsconfig.json
        ├── vite.config.js
        └── app
            ├── composables
            ├── App.vue
            └── main.ts
            
```

## Extension / Backend

To try out the changes you made to the extension within VS Code in a local environment follow these steps:

#### 1. Step Build the Extension

Use the following commands to build the extension.

```shell
npm run esbuild:dev
npm run web:dev
```

#### 2. Step Start the `Extension Host`

Once the extension is build you can open the `Extension Host` within VS Code with `F5`.
If you have used the commands from step one, you can make changes to the code and when you save it, it will
automatically recompile.  
Within the `Extension Host` use `Ctrl/Cmd + r` to update the running extension.

## Webview / Frontend

The `src/web` folder contains the necessary files for building the webapp we use for the webview.  
It is possible to develop the webview detached from the extension within a browser.  
For that use the following command:

```shell
npm run web:browser
```

This will start a dev server. To try out the webview open `http://127.0.0.1:5173/` within your browser.
