
import * as vscode from 'vscode';
import { RenameFileActionParams, RenameFileActionResult } from './types';
import { LanguageClient } from 'vscode-languageclient';
import { awaitInputBox } from './ui';

var languageClient: LanguageClient

export function registerCommands(langClient: LanguageClient) {
    languageClient = langClient
    vscode.commands.registerCommand("als.renameFile", renameFileHandler)
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

            const params: RenameFileActionParams = {
                oldDocument: { uri: fileUri.toString() },
                newDocument: { uri: originalPath + newName }
            }

            languageClient.sendRequest<RenameFileActionResult>("renameFile", params).then(result => {
                const edits = new vscode.WorkspaceEdit()
                console.log(JSON.stringify(result))
                edits.renameFile(vscode.Uri.parse(result.rename.oldUri), vscode.Uri.parse(result.rename.newUri), result.rename.options)
                result.textEdits.forEach(textEdits => {
                    textEdits.edits.forEach(edit => {
                        edits.replace(
                            languageClient.protocol2CodeConverter.asUri(textEdits.textDocument.uri),
                            languageClient.protocol2CodeConverter.asRange(edit.range),
                            edit.newText)
                    })
                })
                vscode.workspace.applyEdit(edits).then(aa => {
                    console.log(JSON.stringify(aa))
                })
            })
        }
    })

}