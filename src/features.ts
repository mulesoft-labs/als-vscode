import { AlsClientCapabilities, AlsInitializeParams } from '@aml-org/als-node-client';
import { DocumentSelector } from 'vscode';
import { ClientCapabilities, InitializeParams, ServerCapabilities, StaticFeature } from 'vscode-languageclient';
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

export class AlsInitializeParamsFeature implements StaticFeature {
	private hotReload: boolean = false
	constructor(hotReload: boolean,  readonly isJvm: boolean) {
		this.hotReload = hotReload
	}
	fillInitializeParams?: (params: InitializeParams) => void = (params: InitializeParams) => {
			var castedParams = params as AlsInitializeParams
			castedParams.hotReload = this.hotReload
	}
	
	fillClientCapabilities(capabilities: ClientCapabilities): void {
		var castedCapabilities = capabilities as AlsClientCapabilities;
		castedCapabilities.customValidations = {
			enabled: !this.isJvm // Custom validations are not supported in JVM
		}
	}
	initialize(capabilities: ServerCapabilities<any>, documentSelector: DocumentSelector): void {}
	dispose(): void {}
	
}