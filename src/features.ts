import { StaticFeature } from 'vscode-languageclient';
export class ConversionFeature implements StaticFeature {
    fillClientCapabilities(capabilities): void {
        capabilities.conversion = { supported: true };
    }
    initialize(): void {
    }
}