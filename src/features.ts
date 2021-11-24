import { AlsClientCapabilities, AlsInitializeParams } from '@aml-org/als-node-client';
import { DocumentSelector } from 'vscode';
import { ClientCapabilities, InitializeParams, ServerCapabilities, StaticFeature } from 'vscode-languageclient';
import { ProjectConfigurationStyles } from './types';
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
	private configurationStyle: string = ProjectConfigurationStyles.Command;
	private hotReload: boolean = false
	constructor(configStyle: String, hotReload: boolean,  readonly isJvm: boolean) {
		switch(configStyle) {
			case ProjectConfigurationStyles.Command:
				this.configurationStyle = ProjectConfigurationStyles.Command;
				break;
			case ProjectConfigurationStyles.File:
				this.configurationStyle = ProjectConfigurationStyles.File;
				break;
			default:
				this.configurationStyle = ProjectConfigurationStyles.Command;
				break;
		}
		this.hotReload = hotReload
	}
	fillInitializeParams?: (params: InitializeParams) => void = (params: InitializeParams) => {
			var castedParams = params as AlsInitializeParams
			castedParams.projectConfigurationStyle = { 
				style: this.configurationStyle
			}
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