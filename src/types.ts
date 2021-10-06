import { AlsConfiguration } from "@aml-org/als-server"
import { TextDocumentIdentifier, InitializeParams, NotificationType, RequestType, WorkspaceEdit } from "vscode-languageclient"

export namespace messages {
    export const AlsConfigurationNotification = {
        type: new NotificationType<AlsConfiguration>("updateConfiguration")
    }
    export const AlsRenameFileRequest = {
        type: new RequestType<RenameFileActionParams, RenameFileActionResult, void>("renameFile")
    }
    
    export const AlsSerializationRequest:  SerializationRequestType = {
        type: new RequestType<SerializationParams, SerializationResult, void>("serialization")
    }
    export const AlsConversionRequest = {
        type: new RequestType<ConversionParams, SerializedDocument, void>("conversion")
    }

    export const AlsGetWorkspaceConfiguration = {
        type: new RequestType<GetWorkspaceConfigurationParams, GetWorkspaceConfigurationResult, void>("getWorkspaceConfiguration")
    }
}