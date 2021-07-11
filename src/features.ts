import { StaticFeature } from 'vscode-languageclient';
export class ConversionFeature implements StaticFeature {
    fillClientCapabilities(capabilities): void {
        capabilities.conversion = { supported: true };
    }
    initialize(): void {
    }
}
export class SerializationNotificationFeature implements StaticFeature {
    fillClientCapabilities(capabilities): void {
        capabilities.serialization = {
            acceptsNotification: true
        };
    }
    initialize(): void {
    }
}