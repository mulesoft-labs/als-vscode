
import * as vscode from 'vscode';
import { RenameFileActionParams, messages, RenameFileActionResult, SerializationParams, SerializationResult, ConversionParams, SerializedDocument, GetWorkspaceConfigurationParams, GetWorkspaceConfigurationResult, DidChangeConfigurationNotificationParams } from '../types';
import { ExecuteCommandRequest, StateChangeEvent } from 'vscode-languageclient';
import { notifyConfig } from '../configuration';
import { registerFormatter } from '../language';
import { LanguageClient } from 'vscode-languageclient/node';
import { conversionHandler, registerProfileHandler, renameFileHandler, serializationHandler, unregisterProfileHandler } from './handlers';
import { ConfigurationViewProvider } from '../ui/configurationView';


// todo: cleanup all URIs using languageClient.code2ProtocolConverter.asUri(fileUri)
// vscode.Uri with `toString()` causes issues with windows paths
export class AlsLanguageServer {
    languageClient: LanguageClient
    readonly wsConfigTreeViewProvider =  new ConfigurationViewProvider(vscode.workspace.workspaceFolders, this)
    constructor(langClient: LanguageClient) {
        this.languageClient = langClient
        vscode.commands.registerCommand("als.renameFile", renameFileHandler(this))
        vscode.commands.registerCommand("als.conversion", conversionHandler(this))
        vscode.commands.registerCommand("als.serialization", serializationHandler(this))
        vscode.commands.registerCommand("als.registerProfile", registerProfileHandler(this))
        vscode.commands.registerCommand("als.unregisterProfile", unregisterProfileHandler(this))
        this.languageClient.onDidChangeState(this.languageClientStateListener)
        registerFormatter(this.languageClient)
    }

    sendSerializationRequest(fileUri: vscode.Uri) {
        const params: SerializationParams = {
            documentIdentifier: { uri: this.languageClient.code2ProtocolConverter.asUri(fileUri) }
        };

        this.languageClient.sendRequest(messages.AlsSerializationRequest.type, params).then(result => {
            this.applySerializationEdits(result);
        });
    }

    sendConversionRequest(fileUri: vscode.Uri, targetUri: vscode.Uri, vendor: string, syntax?: string) {
        const params: ConversionParams = {
            uri: this.languageClient.code2ProtocolConverter.asUri(fileUri),
            target: vendor,
            syntax: syntax
        };

        this.languageClient.sendRequest(messages.AlsConversionRequest.type, params).then(result => {
            this.applyConversionEdits(result, targetUri);
        });
    }


    private applyConversionEdits(result: SerializedDocument, targetUri: vscode.Uri) {
        console.log("applyConversionEdits");
        const edits = new vscode.WorkspaceEdit();
        edits.createFile(targetUri)
        edits.insert(targetUri, new vscode.Position(0, 0), result.document)
        vscode.workspace.applyEdit(edits).then(result =>
            console.log(JSON.stringify(result))
        )
    }

    private applySerializationEdits(result: SerializationResult) {
        console.log("applySerializationEdits");
        console.log(JSON.stringify(result));
        const newUri = vscode.Uri.parse(result.uri + ".json");
        const edits = new vscode.WorkspaceEdit();
        edits.createFile(newUri)
        edits.insert(newUri, new vscode.Position(0, 0), result.model)
        vscode.workspace.applyEdit(edits).then(result =>
            console.log(JSON.stringify(result))
        )
    }

    sendRenameRequest(fileUri: vscode.Uri, originalPath: string, newName: string) {
        const params: RenameFileActionParams = {
            oldDocument: { uri: this.languageClient.code2ProtocolConverter.asUri(fileUri) },
            newDocument: { uri: this.languageClient.code2ProtocolConverter.asUri(vscode.Uri.parse(originalPath + newName)) }
        };

        this.languageClient.sendRequest(messages.AlsRenameFileRequest.type, params).then(result => {
            this.applyRenameEdits(result);
        });
    }

    private applyRenameEdits(result: RenameFileActionResult) {
        const edits = this.languageClient.protocol2CodeConverter.asWorkspaceEdit(result.edits)
        vscode.workspace.applyEdit(edits).then(result => {
            console.log(JSON.stringify(result));
        });
    }

    getWorkspaceConfiguration(fileUri: string): Thenable<GetWorkspaceConfigurationResult> {
        const params: GetWorkspaceConfigurationParams = {
            textDocument: {
                uri: fileUri
            }
        }
        return this.languageClient.sendRequest(messages.AlsGetWorkspaceConfiguration.type, params);
    }

    changeWorkspaceConfigurationCommand(params: DidChangeConfigurationNotificationParams): Thenable<any> {
        return this.languageClient.sendRequest(ExecuteCommandRequest.type, {
            command: 'didChangeConfiguration',
            arguments: [
                {
                    mainUri: params.mainUri,
                    folder: params.folder,
                    dependencies: params.dependencies,
                    customValidationProfiles: params.customValidationProfiles
                },
            ],
        })
            .then(() => console.log(`Notified new configuration: `, params), error => console.error(`Error while notifying new config to ALS`, error))
            .then(() => this.wsConfigTreeViewProvider.refresh(vscode.workspace.workspaceFolders));
    }

    languageClientStateListener = (e: StateChangeEvent) => {
        switch (e.newState) {
            case 1:
                console.log("[ALS] Client stopped")
                this._ready =  false;
                break
            case 2:
                console.log("[ALS] Client running")
                notifyConfig(this.languageClient)
                this._ready = true;
                break
            case 3:
                console.log("[ALS] Client starting")
                break
            default:
                console.log("[ALS] Unknown state: " + e.newState)
        }
    }
    private _ready: boolean = false
    ready = () => {return this._ready}
}