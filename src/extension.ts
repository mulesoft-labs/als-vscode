'use strict'

import * as fs from 'fs'
import * as path from 'path'
import * as net from 'net'
import * as child_process from "child_process"
import * as vscode from 'vscode'
import * as url from 'url'

import { workspace, ExtensionContext, Uri } from 'vscode'
import { BaseLanguageClient, ClientCapabilities, CommonLanguageClient, DocumentSelector, InitializeParams, ServerCapabilities, StaticFeature } from 'vscode-languageclient'
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  StreamInfo,
  TransportKind
} from 'vscode-languageclient/node';
import { registerCommands } from './commands'
import { notifyConfig } from './configuration'
import { ConversionFeature, SerializationNotificationFeature } from './features'
import {AlsInitializeParams, SerializationResult} from './types'

var jsAls = require.resolve("@mulesoft/als-node-client")
var upath = require("upath")

export async function activate(context: ExtensionContext): Promise<LanguageClient> {
    //Create output channel
    let alsLog = vscode.window.createOutputChannel("alsLog");

    //Write to output.
    alsLog.appendLine("Hi! I am alsLog, and I will be your troubleshooting companion for the day. I hope you won't need me!");

	const documentSelector = [
		{ language: 'aml' },
		{ language: 'raml' },
		{ language: 'oas-yaml' },
		{ language: 'oas-json' },
		{ language: 'async-api' }
	]

	function createServer(): Promise<StreamInfo> {

		return new Promise((resolve) => {
			const server = net.createServer(socket => {
				alsLog.appendLine("[ALS] Socket created")

				resolve({
					reader: socket,
					writer: socket,
				});

				socket.on('end', () => alsLog.appendLine("[ALS] Disconnected"))
			}).on('error', (err) => { throw err })

			const javaExecutablePath = findJavaExecutable('java');
			server.listen(() => {
				const runParams = vscode.workspace.getConfiguration(`amlLanguageServer.run`)
				const isJVM = runParams.get("platform") === "jvm"
				const customPath: string = runParams.get("path")
				const logPath: string = runParams.get("logPath")
				const isLocal = customPath && customPath.length > 0
				const debugPort: number = isJVM ? runParams.get("debug") : 0
				
				const agentLibArgsDebug = '-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=' + debugPort

				const extensionPath = context.extensionPath
				const storagePath = context.storagePath || context.globalStoragePath

				const jarPath = isLocal? customPath : `${extensionPath}/lib/als-server.jar`
				const jsPath = isLocal? customPath : jsAls
				// const jsPath = require.resolve(`${extensionPath}/lib/node-package/dist/als-node-client.min.js`)

				const logFile = logPath !== null ? logPath : `${storagePath}/vscode-aml-language-server.log`
				
				const path = isJVM? jarPath : jsPath
				
				const folder = workspace.rootPath? workspace.rootPath : "";
				const options = { 
					cwd: folder
				}
				const address = server.address()
				const port = typeof address === 'object' ? address.port : 0

				alsLog.appendLine("[ALS] Configuration: " + JSON.stringify(runParams))
				alsLog.appendLine("[ALS] Extension path: " + extensionPath)
				alsLog.appendLine("[ALS] Storage path: " + storagePath)
				alsLog.appendLine("[ALS] used path: " + path)
				alsLog.appendLine("[ALS] jar path: " + jarPath)
				alsLog.appendLine("[ALS] js path: " + jsPath)
				alsLog.appendLine("[ALS] Log path: " + logFile)
				alsLog.appendLine("[ALS] Server port: " + port)
				alsLog.appendLine("[ALS] java exec file: " + javaExecutablePath)
				alsLog.appendLine("[ALS] RUN AS JVM?: " + isJVM)
				alsLog.appendLine("[ALS] debug mode?: " + debugPort)
				
				const jsArgs: string[] = [ jsPath, '--port', port.toString() ]

				const jvmArgsDebug: string[] = [
					'-jar',
					agentLibArgsDebug,
					jarPath,
					'--port',
					port.toString()
				]

				const jvmArgs: string[] = [
					'-jar',
					jarPath,
					'--port',
					port.toString()
				]
				alsLog.appendLine("[ALS] Spawning at port: " + port);
				const process = isJVM? child_process.spawn(javaExecutablePath,
					debugPort > 0 ? jvmArgsDebug : jvmArgs,
					options) : child_process.spawn('node', jsArgs, options)

				if (!fs.existsSync(storagePath))
					fs.mkdirSync(storagePath)

				const logStream = fs.createWriteStream(logFile, { flags: 'w' })
				
				process.stdout.pipe(logStream)
				process.stderr.pipe(logStream)
			});
		});
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: documentSelector,
		synchronize: {
			configurationSection: 'amlLanguageServer',
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
        uriConverters: {
            code2Protocol: uri => new url.URL(uri.toString(true)).href,
            protocol2Code: str => Uri.parse(str)
        }
	}

	const languageClient = new LanguageClient(
		'amlLanguageServer', 
		'AML Language Server', 
		createServer, 
		clientOptions)

	registerCommands(languageClient)
	workspace.onDidChangeConfiguration(() => notifyConfig(languageClient))

	const disposable = languageClient.start()

	languageClient.registerFeatures([
		// new SerializationNotificationFeature(),
		new AlsInitializeParamsFeature(),
		new ConversionFeature()
	])

	context.subscriptions.push(disposable)

	await languageClient.onReady();
    return languageClient;
}

// MIT Licensed code from: https://github.com/georgewfraser/vscode-javac
function findJavaExecutable(binname: string) {
	binname = correctBinname(binname);

	// First search each JAVA_HOME bin folder
	if (process.env['JAVA_HOME']) {
		let workspaces = process.env['JAVA_HOME'].split(path.delimiter);
		for (let i = 0; i < workspaces.length; i++) {
			let binpath = path.join(workspaces[i], 'bin', binname);
			if (fs.existsSync(binpath)) {
				return binpath;
			}
		}
	}

	// Then search PATH parts
	if (process.env['PATH']) {
		let pathparts = process.env['PATH'].split(path.delimiter);
		for (let i = 0; i < pathparts.length; i++) {
			let binpath = path.join(pathparts[i], binname);
			if (fs.existsSync(binpath)) {
				return binpath;
			}
		}
	}

	// Else return the binary name directly (this will likely always fail downstream) 
	return null;
}

function correctBinname(binname: string) {
	if (process.platform === 'win32')
		return binname + '.exe';
	else
		return binname;
}

function withRootSlash(path: String) {
	return path.startsWith("/") ? path : "/" + path
}

class AlsInitializeParamsFeature implements StaticFeature {
	fillInitializeParams?: (params: InitializeParams) => void = (params: InitializeParams) => {
			var castedParams = params as AlsInitializeParams
			castedParams.projectConfigurationStyle = { 
				style: "command"
			}
	}
	fillClientCapabilities(capabilities: ClientCapabilities): void {
		// do nothing
	}
	initialize(capabilities: ServerCapabilities<any>, documentSelector: DocumentSelector): void {
		// do nothing
	}
	dispose(): void {
		// do nothing
	}
	

}