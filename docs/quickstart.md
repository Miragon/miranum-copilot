# Getting started

> **_NOTE:_** At some point in the future, this repository will be migrated to our [main repository](https://github.com/FlowSquad/miranum-ide).
 
### Built With

 
### Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create.
Any contributions you make are **greatly appreciated**.
Please use semantic commit messages as described in [here](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716).

If you have a suggestion that would make this better, please open an issue with the tag "enhancement", fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Open an issue with the tag "enhancement"
2. Fork the Project
3. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
4. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the Branch (`git push origin feat/AmazingFeature`)
6. Open a Pull Request

### Project structure
```
.
├── package.json
├── tsconfig.json
├── resources
│   └── css
│       └── reset.css
└── src
    ├── extension.ts
    ├── Copilot.ts
    ├── lib
    ├── shared      // between 'backend' and 'frontend' (= webview)
    ├── utils
    └── web
        ├── tsconfig.json
        ├── vite.config.js
        └── app
            └── main.ts
```

### Quickstart
```shell
git clone https://github.com/FlowSquad/miranum-copilot.git
cd miranum-copilot
```
```shell
npm install
npm run build
```
```shell
code .
```
Open `Extension Host` with `F5` and open the example folder.

### Development
```shell
npm run esbuild-watch
```

The `web` folder contains the necessary files for building the webapp we use for the webview.  
So it is possible to develop the webview detached from the extension.  
For bundling the webview we use `vite`.  
**During development use `npm run web-dev` for HMR.**