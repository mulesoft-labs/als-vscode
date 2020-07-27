
import * as vscode from 'vscode';
import { RenameFileActionParams, messages, RenameFileActionResult } from './types';
import { LanguageClient, StateChangeEvent } from 'vscode-languageclient';
import { awaitInputBox } from './ui';
import { notifyConfig } from './configuration';

var languageClient: LanguageClient

export function registerCommands(langClient: LanguageClient) {
    languageClient = langClient
    vscode.commands.registerCommand("als.renameFile", renameFileHandler)
    languageClient.onDidChangeState(languageClientStateListener)
}


const renameFileHandler = (fileUri: vscode.Uri) => {
    console.log("als.rename called")
    var splittedPath = fileUri.toString().split("/")
    const oldFileName = splittedPath[splittedPath.length - 1]
    const splittedName = oldFileName.split(".")
    const currentExtension = splittedName[splittedName.length - 1]
    const originalPath = fileUri.toString().slice(0, fileUri.toString().lastIndexOf(oldFileName))
    console.log("Old name: " + fileUri.toString() + " (" +oldFileName + ")")

    awaitInputBox(oldFileName, "New name", "New file name", [0, oldFileName.lastIndexOf(currentExtension) - 1])
        .then((newName) => {
            if(newName === undefined) {
                console.log("Rename cancelled")
            } else { 
                console.log("New name: " +  originalPath + newName)
                sendRenameRequest(fileUri, originalPath, newName);
            }
        })

}

function sendRenameRequest(fileUri: vscode.Uri, originalPath: string, newName: string) {
    const params: RenameFileActionParams = {
        oldDocument: { uri: fileUri.toString() },
        newDocument: { uri: originalPath + newName }
    };

    languageClient.sendRequest(messages.AlsRenameFileRequest.type, params).then(result => {
        applyRenameEdits(result);
    });
}

function applyRenameEdits(result: RenameFileActionResult) {
    const edits = languageClient.protocol2CodeConverter.asWorkspaceEdit(result.edits)
    vscode.workspace.applyEdit(edits).then(result => {
        console.log(JSON.stringify(result));
    });
}

export const languageClientStateListener = (e: StateChangeEvent) => {
    switch(e.newState){
        case 1:
            console.log("[ALS] Client stopped")
            break
        case 2:
            console.log("[ALS] Client running")
            notifyConfig(languageClient)
            break
        case 3:
            console.log("[ALS] Client starting")
            break
        default:
            console.log("[ALS] Unknown state: " + e.newState)
    }
}