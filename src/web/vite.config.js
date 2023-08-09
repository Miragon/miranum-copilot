import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
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
                    isCustomElement: (tag) => tag.includes("-"),
                },
            },
        }),
    ],
    build: {
        target: "es2021",
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        outDir: "dist/client",
        rollupOptions: {
            input: "src/web/app/main.ts",
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
});
