import { defineConfig } from "vite";

export default defineConfig({
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
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
});
