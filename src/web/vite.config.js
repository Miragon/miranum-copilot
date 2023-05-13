import { defineConfig } from "vite";
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
    build: {
        target: "es2021",
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        lib: {
            entry: "src/web/app/main.ts",
            name: "webview",
            fileName: "webview",
        },
        outDir: "dist/client",
        rollupOptions: {},
        minify: "esbuild",
    },
    define: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
});
