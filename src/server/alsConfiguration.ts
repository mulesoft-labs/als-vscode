import { messages } from "../types";
import { LanguageClient } from "vscode-languageclient/node";
import { languages, workspace } from "vscode";
import { AlsConfiguration } from "@aml-org/als-node-client";


export const initialConfiguration: AlsConfiguration = {
    formattingOptions: {
        "application/raml+yaml": { tabSize: 2, preferSpaces: true }
    },
    templateType: "FULL",
    prettyPrintSerialization: true
}

export var currentConfiguration: AlsConfiguration = initialConfiguration

export function notifyConfig(languageClient: LanguageClient) {
    readSettingsFromVSCode()
    languageClient.sendNotification(messages.AlsConfigurationNotification.type, currentConfiguration)
}

function readSettingsFromVSCode() {
    const currentSettings = workspace.getConfiguration("amlLanguageServer.formattingOptions")
    currentConfiguration = {
        formattingOptions: {
            "application/raml+yaml": { tabSize: currentSettings.get("RAML.tabSize"), preferSpaces: true },
            "application/yaml": { tabSize: currentSettings.get("OAS.YAML.tabSize"), preferSpaces: true },
            "application/json": { tabSize: currentSettings.get("OAS.JSON.tabSize"), preferSpaces: currentSettings.get("OAS.JSON.preferSpaces") }
        },
        templateType: currentSettings.get("templateType"),
        prettyPrintSerialization: workspace.getConfiguration("amlLanguageServer").get("shouldPrettyPrintSerialization")
    }
}