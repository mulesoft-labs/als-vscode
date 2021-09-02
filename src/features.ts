import { DocumentSelector } from 'vscode';
import { ClientCapabilities, InitializeParams, ServerCapabilities, StaticFeature } from 'vscode-languageclient';
import { AlsInitializeParams, ProjectConfigurationStyles } from './types';
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
	private configurationStyle: ProjectConfigurationStyles = ProjectConfigurationStyles.Command;
	constructor(configurationStyle: String) {
		switch(configurationStyle) {
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
		console.log("ProjectConfigurationStyle: " + this.configurationStyle)
	}
	fillInitializeParams?: (params: InitializeParams) => void = (params: InitializeParams) => {
			var castedParams = params as AlsInitializeParams
			castedParams.projectConfigurationStyle = { 
				style: this.configurationStyle.toString()
			}
	}
	fillClientCapabilities(capabilities: ClientCapabilities): void {}
	initialize(capabilities: ServerCapabilities<any>, documentSelector: DocumentSelector): void {}
	dispose(): void {}
	
}