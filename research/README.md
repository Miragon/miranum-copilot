# Setup Python Environment

## 1. Install Miniconda

[Here](https://docs.conda.io/projects/miniconda/en/latest/) are the Installation Guides for the various OS.

Varify the installation

```shell
conda --version
```

## 2. Install Packages

[Environment.yaml](./environment.yaml) contains all necessary packages.  
You can import this environment with:

```shell
conda env create -f environment.yaml
```

To activate the environment enter:

```shell
conda activate msv
```

## 3. Setup PyCharm

1. Go to `Settings > Project > Python Interpreter > Add Interpreter > Add Local Interpreter...`
2. Select `Conda Environment`
3. Select `Use existing environment`
4. Select `msv` from the dropdown