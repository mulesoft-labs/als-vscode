import { AlsConfiguration, messages } from "./types";
import { LanguageClient } from "vscode-languageclient";
import { workspace } from "vscode";


export const initialConfiguration: AlsConfiguration = {
    formattingOptions: {
        "application/raml+yaml": { tabSize: 2, preferSpaces: true }
    },
    disableTemplates: false
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
        disableTemplates: currentSettings.get("disableTemplates")
    }
}