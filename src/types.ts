import { SerializationEventNotification, AlsConfiguration, ConfigurationNotification, GetWorkspaceConfigurationRequestType, AlsRenameFileRequestType, RenameFileActionParams, RenameFileActionResult, SerializationRequestType, SerializationParams, SerializationResult, ConversionParams, SerializedDocument, ConversionRequestType, GetWorkspaceConfigurationParams, GetWorkspaceConfigurationResult, AlsDependency, Dependency, FileContentsRequestType, FileContentsResponse } from "@aml-org/als-node-client"
import {  NotificationType, RequestType, TextDocumentIdentifier } from "vscode-languageclient"

export namespace messages {
    export const AlsConfigurationNotification: ConfigurationNotification = {
        type: new NotificationType<AlsConfiguration>("updateConfiguration")
    }
    export const AlsRenameFileRequest: AlsRenameFileRequestType = {
        type: new RequestType<RenameFileActionParams, RenameFileActionResult, void>("renameFile")
    }
    export const AlsSerializationRequest: SerializationRequestType = {
        type: new RequestType<SerializationParams, SerializationResult, void>("serialization")
    }
    export const AlsFileContentsRequestType: FileContentsRequestType = {
        type: new RequestType<TextDocumentIdentifier, FileContentsResponse, void>("fileContents")
    }
    export const AlsSerializationNotification: SerializationEventNotification = {
        type: new NotificationType<SerializationResult>("serializeJSONLD")
    }
    export const AlsConversionRequest: ConversionRequestType = {
        type: new RequestType<ConversionParams, SerializedDocument, void>("conversion")
    }

    export const AlsGetWorkspaceConfiguration: GetWorkspaceConfigurationRequestType = {
        type: new RequestType<GetWorkspaceConfigurationParams, GetWorkspaceConfigurationResult, void>("getWorkspaceConfiguration")
    }
}

export function isDependencyConfiguration(t: AlsDependency): t is Dependency {
    return (<Dependency>t).scope !== undefined;
 }
