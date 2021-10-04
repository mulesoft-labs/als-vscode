
import * as vscode from 'vscode';
import { RenameFileActionParams, messages, RenameFileActionResult, SerializationParams, SerializationResult, ConversionParams, SerializedDocument, GetWorkspaceConfigurationParams, GetWorkspaceConfigurationResult, DidChangeConfigurationNotificationParams, ProjectConfigurationStyles } from '../types';
import { ExecuteCommandRequest, StateChangeEvent } from 'vscode-languageclient';
import { notifyConfig } from './alsConfiguration';
import { FormattingProvider, LANGUAGE_ID } from '../language';
import { LanguageClient } from 'vscode-languageclient/node';
import { conversionHandler, registerProfileHandler, renameFileHandler, serializationHandler, setMainFileHandler, unregisterProfileHandler } from './handlers';
import { ConfigurationViewProvider } from '../ui/configurationView';
import { SettingsManager } from '../settings';
import { Disposable } from 'vscode';


// todo: cleanup all URIs using languageClient.code2ProtocolConverter.asUri(fileUri)
// vscode.Uri with `toString()` causes issues with windows paths
export class AlsLanguageClient {
    disposables: Disposable[] = []
    readonly wsConfigTreeViewProvider = new ConfigurationViewProvider(vscode.workspace.workspaceFolders, this)
    constructor(readonly languageClient: LanguageClient, private readonly extensionConfigurationManager: SettingsManager) {
        this.disposable(vscode.commands.registerCommand("als.renameFile", renameFileHandler(this)))
        this.disposable(vscode.commands.registerCommand("als.conversion", conversionHandler(this)))
        this.disposable(vscode.commands.registerCommand("als.serialization", serializationHandler(this)))
        if(this.configurationByCommand){
            this.disposable(vscode.commands.registerCommand("als.setMainFile", setMainFileHandler(this)))
            this.disposable(vscode.commands.registerCommand("als.registerProfile", registerProfileHandler(this)))
            this.disposable(vscode.commands.registerCommand("als.unregisterProfile", unregisterProfileHandler(this)))
        }
        this.disposable(this.languageClient.onDidChangeState(this.languageClientStateListener))
        this.disposable(vscode.languages.registerDocumentFormattingEditProvider(LANGUAGE_ID, new FormattingProvider(languageClient)))
        this.disposable(vscode.languages.registerDocumentRangeFormattingEditProvider(LANGUAGE_ID, new FormattingProvider(languageClient)))
        this.disposable(vscode.workspace.onDidChangeWorkspaceFolders(e => {
            this.wsConfigTreeViewProvider.refresh(vscode.workspace.workspaceFolders);
        }))
        this.disposable(languageClient.onTelemetry(t => {
            if(t.event === "End report" && t.messageType === "END_CUSTOM_DIAGNOSTIC"){
                // console.log(t)
            }
        }))
        vscode.window.registerTreeDataProvider(
            'aml-configuration',
            this.wsConfigTreeViewProvider
        );
    }

    configurationStyle: ProjectConfigurationStyles = vscode.workspace.getConfiguration(`amlLanguageServer.run`).get("configurationStyle")
    configurationByCommand: Boolean = this.configurationStyle == ProjectConfigurationStyles.Command

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
                this._ready = false;
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
    ready = () => { return this._ready }

    disposable(d: Disposable) {
        this.disposables.push(d);
    }

    dispose() {
        this.disposables.forEach((d: Disposable) => d.dispose())
    }
}