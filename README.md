# aml-vscode (EXPERIMENTAL)

This is a custom extension for [VS Code](https://github.com/microsoft/vscode) based on the Language Server Protocol (LSP). It provides support for the features listed below as well as other AML-based custom features.

## Supported Web Apis:
* RAML 1.0
* RAML 0.8
* OpenAPI 2.0
* OpenAPI 3.0.0
* AsyncAPI 2.0
* AML documents: beta

## Features
* Completion
* Diagnostics
* Structure
* Hover
* Document Links
* Goto Definition
* Find References
* Rename
* Rename File
* CodeActions
* Serialize/Conversion (beta)

## AML Custom Features
* Semantic Extensions
* Custom Validations
* Dialects Hot Reload (Needs to be enabled from extension settings)

## Requirements

NodeJS installed (v16.19.0 LTS recommended)

Install VSCE package

## Building commands

```shell
npm install
npm run compile
vsce package
```

-----------------------------------------------------------------------------------------------------------

### For more information

* [ALS page](https://github.com/mulesoft/als)

**Enjoy!**
