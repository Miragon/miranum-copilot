import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(({ command }) => {
    let root = "";
    let indexHtml = "index.html";
    if (command === "build") {
        root = "src/web";
    } else {
        indexHtml = "index_dev.html";
    }
    return {
        resolve: {
            alias: [
                {
                    find: "@",
                    replacement: path.resolve(__dirname, "./app"),
                },
            ],
        },
        plugins: [
            vue({
                template: {
                    compilerOptions: {
                        // treat all tags with a dash as custom elements
                        isCustomElement: (tag) => tag.includes("vscode-"),
                    },
                },
            }),
            createHtmlPlugin({ template: indexHtml }),
            viteStaticCopy({
                targets: [
                    {
                        src: "./node_modules/@vscode/codicons/dist/codicon.css",
                        dest: "codicons/",
                    },
                    {
                        src: "./node_modules/@vscode/codicons/dist/codicon.ttf",
                        dest: "codicons/",
                    },
                ],
            }),
        ],
        build: {
            target: "es2021",
            commonjsOptions: {
                transformMixedEsModules: true,
            },
            outDir: "dist/client",
            rollupOptions: {
                input: `${root}/app/main.ts`,
                output: {
                    // don't hash the name of the output file (index.js)
                    entryFileNames: `[name].js`,
                    assetFileNames: `[name].[ext]`,
                },
            },
        },
        define: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
    };
});
