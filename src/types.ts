import { AlsConfiguration, ConfigurationNotification, GetWorkspaceConfigurationRequestType, AlsRenameFileRequestType, RenameFileActionParams, RenameFileActionResult, SerializationRequestType, SerializationParams, SerializationResult, ConversionParams, SerializedDocument, ConversionRequestType, GetWorkspaceConfigurationParams, GetWorkspaceConfigurationResult, AlsDependency, Dependency } from "@aml-org/als-node-client"
import {  NotificationType, RequestType } from "vscode-languageclient"

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
