import { AlsLanguageClient } from "./als"
import * as vscode from 'vscode';
import { awaitInputBox } from "../ui/ui";
import {alsLog} from "../extension"
import { DidChangeConfigurationNotificationParams } from "@aml-org/als-node-client";
import { isDependencyConfiguration } from "../types";
var path = require("path")
export const setMainFileHandler = (als: AlsLanguageClient) => {
  return (fileUri: vscode.Uri) => {
      alsLog.appendLine("Setting main file: " + fileUri.toString())
      const uri = als.languageClient.code2ProtocolConverter.asUri(fileUri);
      als.getWorkspaceConfiguration(uri).then(workspaceConfig => {
        var relativePath = decodeURI(uri.replace(workspaceConfig.configuration.folder, ""))
        if(relativePath.startsWith("/")) relativePath = relativePath.substring(1)
        const newWorkspaceConfig: DidChangeConfigurationNotificationParams = {
          ...workspaceConfig.configuration,
          mainPath: relativePath
        };
        als.changeWorkspaceConfigurationCommand(newWorkspaceConfig);
      });
  }
}

export const registerProfileHandler = (als: AlsLanguageClient) => {
  return (fileUri: vscode.Uri) => {
    const scopeName = "custom-validation"
    registerDependency(als, fileUri, scopeName);
  }
}

export const registerSemanticHandler = (als: AlsLanguageClient) => {
  return (fileUri: vscode.Uri) => {
    const scopeName = "semantic-extension"
    registerDependency(als, fileUri, scopeName);
  }
}

export const unregisterProfileHandler = (als: AlsLanguageClient) => {
  return (fileUri: vscode.Uri) => {
    const scopeName = "custom-validation"
    unregisterDependency(scopeName, fileUri, als);
  }
}

export const unregisterSemanticHandler = (als: AlsLanguageClient) => {
  return (fileUri: vscode.Uri) => {
    const scopeName = "semantic-extension"
    unregisterDependency(scopeName, fileUri, als);
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

function unregisterDependency(scopeName: string, fileUri: vscode.Uri, als: AlsLanguageClient) {
  alsLog.appendLine("Unregistering " + scopeName + " " + fileUri);
  const uri = als.languageClient.code2ProtocolConverter.asUri(fileUri);
  als.getWorkspaceConfiguration(uri).then(workspaceConfig => {
    const newWorkspaceConfig: DidChangeConfigurationNotificationParams = {
      mainPath: workspaceConfig.configuration.mainPath,
      folder: workspaceConfig.configuration.folder,
      dependencies: workspaceConfig.configuration.dependencies
        .filter(v => {
          return !isDependencyConfiguration(v) || !(v.scope == scopeName && v.file.toLowerCase() == uri.toLowerCase());
        })
    };
    
    als.changeWorkspaceConfigurationCommand(newWorkspaceConfig);
  });
}

function registerDependency(als: AlsLanguageClient, fileUri: vscode.Uri, scopeName: string) {
  alsLog.appendLine("Registering " + scopeName + " " + fileUri)
  const uri = als.languageClient.code2ProtocolConverter.asUri(fileUri);
  als.getWorkspaceConfiguration(uri).then(workspaceConfig => {
    const newWorkspaceConfig: DidChangeConfigurationNotificationParams = {
      mainPath: workspaceConfig.configuration.mainPath,
      folder: workspaceConfig.configuration.folder,
      dependencies: [...workspaceConfig.configuration.dependencies, { file: uri, scope: scopeName }]
    };
    als.changeWorkspaceConfigurationCommand(newWorkspaceConfig);
  });
}
