import { TextDocumentIdentifier, InitializeParams, NotificationType, RequestType, WorkspaceEdit } from "vscode-languageclient"
import { workspace } from "vscode";

interface IMap<V> { [key: string]: V }

const platform = workspace.getConfiguration("amlLanguageServer.run").get("platform")



export namespace messages {
    export const AlsConfigurationNotification = {
        type: new NotificationType<AlsConfiguration>("updateConfiguration")
    }
    export const AlsRenameFileRequest = {
        type: new RequestType<RenameFileActionParams, RenameFileActionResult, void>("renameFile")
    }
    export const AlsSerializationRequest = {
        type: new RequestType<SerializationParams, SerializationResult, void>("serialization")
    }
    export const AlsConversionRequest = {
        type: new RequestType<ConversionParams, SerializedDocument, void>("conversion")
    }
}

export type SerializationParams = {
    documentIdentifier: TextDocumentIdentifier
 }

 export type SerializationResult = {
     uri: string,
     model: any
  }

  export type ConversionParams = {
    uri: string,
    target: string,
    syntax?: string
 }

 export type SerializedDocument = {
     uri: string,
     document: string
  }


export type RenameFileActionParams = {
    oldDocument: TextDocumentIdentifier,
    newDocument: TextDocumentIdentifier
 }

 export type RenameFileActionResult = {
     edits: WorkspaceEdit
 }


export type AlsConfiguration = {
    formattingOptions: IMap<AlsFormattingOptions>
    templateType: String
}

export type AlsFormattingOptions = {
    tabSize: number,
    preferSpaces: Boolean,
}

export type AlsInitializeParams = InitializeParams & {
    alsConfiguration: AlsConfiguration
}

