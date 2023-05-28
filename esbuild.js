// file: esbuild.js

//code from https://github.com/microsoft/vscode-webview-ui-toolkit/blob/main/docs/getting-started.md#part-2-install-and-set-up-the-toolkit

const webviewConfig = {
    ...baseConfig,
    target: "es2020",
    format: "esm",
    entryPoints: ["./src/web/app/main.ts"],
    outfile: "./out/webview.js",
};
  
(async () => {
    const args = process.argv.slice(2);
    try {
        if (args.includes("--watch")) {
        // Build and watch extension and webview code
            console.log("[watch] build started");
            await build({
                ...extensionConfig,
                ...watchConfig,
            });
            await build({
                ...webviewConfig,
                ...watchConfig,
            });
            console.log("[watch] build finished");
        } else {
        // Build extension and webview code
            await build(extensionConfig);
            await build(webviewConfig);
            console.log("build complete");
        }
    } catch (err) {
        process.stderr.write(err.stderr);
        process.exit(1);
    }
})();