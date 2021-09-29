import { AlsLanguageClient } from "./als"
import * as vscode from 'vscode';
import { DidChangeConfigurationNotificationParams, DependencyConfiguration, isDependencyConfiguration } from "../types";
import { awaitInputBox } from "../ui/ui";
import {alsLog} from "../extension"

export const registerProfileHandler = (als: AlsLanguageClient) => {
  return (fileUri: vscode.Uri) => {
    alsLog.appendLine("Registering profile " + fileUri)
    const uri = als.languageClient.code2ProtocolConverter.asUri(fileUri)
    als.getWorkspaceConfiguration(uri).then(workspaceConfig => {
      const newWorkspaceConfig: DidChangeConfigurationNotificationParams = {
        mainUri: workspaceConfig.configuration.mainUri,
        folder: uri,
        dependencies: [...workspaceConfig.configuration.dependencies, {file: uri, scope: "custom-validation"}]
      }
      als.changeWorkspaceConfigurationCommand(newWorkspaceConfig);
    })
  }
}

export const unregisterProfileHandler = (als: AlsLanguageClient) => {
  return (fileUri: vscode.Uri) => {
    alsLog.appendLine("Unregistering profile " + fileUri)
    const uri = als.languageClient.code2ProtocolConverter.asUri(fileUri)
    als.getWorkspaceConfiguration(uri).then(workspaceConfig => {
      const newWorkspaceConfig: DidChangeConfigurationNotificationParams = {
        mainUri: workspaceConfig.configuration.mainUri,
        folder: uri,
        dependencies: workspaceConfig.configuration.dependencies
        .filter(v => {
          !isDependencyConfiguration(v) || !(v.scope == "custom-validation" && v.file.toLowerCase() == uri.toLowerCase())
        })
      }
      als.changeWorkspaceConfigurationCommand(newWorkspaceConfig);
    })
  }
}


export const serializationHandler = (als: AlsLanguageClient) => {
  return (fileUri: vscode.Uri) => {
    alsLog.appendLine("als.serialization called")
    als.sendSerializationRequest(fileUri)
  }
}

export const renameFileHandler = (als: AlsLanguageClient) => {
  return (fileUri: vscode.Uri) => {
    alsLog.appendLine("als.rename called")
    var splittedPath = fileUri.toString().split("/")
    const oldFileName = splittedPath[splittedPath.length - 1]
    const splittedName = oldFileName.split(".")
    const currentExtension = splittedName[splittedName.length - 1]
    const originalPath = fileUri.toString().slice(0, fileUri.toString().lastIndexOf(oldFileName))
    alsLog.appendLine("Old name: " + fileUri.toString() + " (" + oldFileName + ")")

    awaitInputBox(oldFileName, "New name", "New file name", [0, oldFileName.lastIndexOf(currentExtension) - 1])
      .then((newName) => {
        if (newName === undefined) {
          alsLog.appendLine("Rename cancelled")
        } else {
          alsLog.appendLine("New name: " + originalPath + newName)
          als.sendRenameRequest(fileUri, originalPath, newName);
        }
      })
  }
}

export const conversionHandler = (als: AlsLanguageClient) => {
  return (fileUri: vscode.Uri) => {
    alsLog.appendLine("als.conversion called")
    var splittedPath = als.languageClient.code2ProtocolConverter.asUri(fileUri).split("/")
    const oldFileName = splittedPath[splittedPath.length - 1]
    const splittedName = oldFileName.split(".")
    const currentExtension = splittedName[splittedName.length - 1]
    const originalPath = als.languageClient.code2ProtocolConverter.asUri(fileUri).slice(0, als.languageClient.code2ProtocolConverter.asUri(fileUri).lastIndexOf(oldFileName))
    alsLog.appendLine("Old name: " + als.languageClient.code2ProtocolConverter.asUri(fileUri) + " (" + oldFileName + ")")


    awaitInputBox(oldFileName, "New name", "New file name", [0, oldFileName.lastIndexOf(currentExtension) - 1])
      .then((newName) => {
        if (newName === undefined) {
          alsLog.appendLine("Conversion cancelled")
        } else {
          const newUri = vscode.Uri.parse(originalPath + newName)
          alsLog.appendLine("New conversion name: " + newUri)

          awaitInputBox("AMF Graph", "Target Vendor", "New file Vendor Name")
            .then((vendor) => {
              if (vendor === undefined) {
                alsLog.appendLine("Conversion cancelled")
              } else {
                alsLog.appendLine("New conversion vendor: " + vendor)
                als.sendConversionRequest(fileUri, newUri, vendor);
              }
            })
        }
      })
  }
}