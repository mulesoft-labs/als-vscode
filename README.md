# aml-vscode README

Internal mulesoft extension to play arround with ALS server. As ALS uses AMF framework, you also will be able to test AMF validations.

## Supported Web Apis:
* Raml 1.0
* Raml 0.8
* Oas 2.0
* OpenApi 3.0.0
* AML instance documents: beta

## Features

* Completion
* Diagnostics
* Structure
* Document Links
* Goto Definition
* Find Uses (beta)

## Requirements

Java 1.8 or later

## ALS setup
To run the ALS-JVM dependent version you need to build the fat jar for als, in als project (use sbt -mem 4096 serverJVM/assembly) and copy that jar into folder lib renaming it to als-server.jar.
"lib/als-server.jar" should exists before start the extension.

## Known Issues

## Release Notes

### 0.1.0

Release for ALS v2.3.4 with AMF v4.1.1

(Does not aml parallel support)

### 1.0.0

Release for ALS v3.0.0 using LSP 3.15

-----------------------------------------------------------------------------------------------------------

### For more information

* [ALS page](https://github.com/mulesoft/als)

**Enjoy!**
