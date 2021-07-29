import { InitializeParams, StaticFeature } from 'vscode-languageclient';
export class ConversionFeature implements StaticFeature {
    fillInitializeParams?: (params: InitializeParams) => void;
    dispose(): void {
        // do nothing
    }
    fillClientCapabilities(capabilities): void {
        capabilities.conversion = { supported: true };
    }
    initialize(): void {
    }
}
export class SerializationNotificationFeature implements StaticFeature {
    fillInitializeParams?: (params: InitializeParams) => void;
    dispose(): void {
        // do nothing
    }
    fillClientCapabilities(capabilities): void {
        capabilities.serialization = {
            acceptsNotification: true
        };
    }
    initialize(): void {
    }
}