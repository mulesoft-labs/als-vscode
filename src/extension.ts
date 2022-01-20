'use strict'

import * as fs from 'fs'
import * as path from 'path'
import * as net from 'net'
import * as child_process from "child_process"
import * as vscode from 'vscode'
import * as url from 'url'

import { workspace, ExtensionContext, Uri } from 'vscode'
import {
	LanguageClient,
	LanguageClientOptions,
	StreamInfo
} from 'vscode-languageclient/node';
import { notifyConfig } from './server/alsConfiguration'
import { AlsInitializeParamsFeature, ConversionFeature } from './features'
import { AlsLanguageClient } from './server/als'
import { SettingsManager } from './settings'

var jsAls = require.resolve("@aml-org/als-node-client")
export let alsLog = vscode.window.createOutputChannel("alsLog");

export class AlsResolver {
	als: AlsLanguageClient;
	getCurrent = () => {
		return this.als;
	}
}
export async function activate(context: ExtensionContext): Promise<AlsResolver> {
	const resolver = new AlsResolver();
	//Write to output.
	alsLog.appendLine("Hi! I am alsLog, and I will be your troubleshooting companion for the day. I hope you won't need me!");
	await createLanguageClient(alsLog, context).then(alsClient => {
		resolver.als = alsClient;
		return resolver.getCurrent();
	})
	
	async function restartAls() {
		resolver.als.dispose();
		const alsClient = await createLanguageClient(alsLog, context);
		resolver.als = alsClient;
	}

	context.subscriptions.push(vscode.commands.registerCommand("als.restart", restartAls));
	return Promise.resolve(resolver);
}

async function createLanguageClient(alsLog: vscode.OutputChannel, context: ExtensionContext): Promise<AlsLanguageClient> {

	const documentSelector = [
		{ language: 'aml' },
		{ language: 'aml-json' },
		{ language: 'raml' },
		{ language: 'oas-yaml' },
		{ language: 'oas-json' },
		{ language: 'async-api' }
	]

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
	const runParams = vscode.workspace.getConfiguration(`amlLanguageServer.run`)

	const languageClient = new LanguageClient(
		'amlLanguageServer',
		'AML Language Server',
		createServer(alsLog, context),
		clientOptions)

	const settingsManager = new SettingsManager(["amlLanguageServer.run"])
	const als = new AlsLanguageClient(languageClient, settingsManager)

	
	const isJVM = runParams.get("platform") === "jvm";
	languageClient.registerFeatures([
		new AlsInitializeParamsFeature(runParams.get("hotReload"), isJVM),
		new ConversionFeature()
	])

	workspace.onDidChangeConfiguration(() => notifyConfig(languageClient))

	const disposable = languageClient.start()
	als.disposables.push(disposable)

	await languageClient.onReady();
	return als;
}

function createServer(alsLog: vscode.OutputChannel, context: ExtensionContext): () => Promise<StreamInfo> {
	return () => {
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

				const jarPath = isLocal ? customPath : `${extensionPath}/lib/als-server.jar`
				const jsPath = isLocal ? customPath : jsAls

				const logFile = logPath !== null ? logPath : `${storagePath}/vscode-aml-language-server.log`

				const path = isJVM ? jarPath : jsPath

				const folder = workspace.rootPath ? workspace.rootPath : "";
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

				const jsArgs: string[] = [jsPath, '--port', port.toString()]

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
				const process = isJVM ? child_process.spawn(javaExecutablePath,
					debugPort > 0 ? jvmArgsDebug : jvmArgs,
					options) : child_process.spawn('node', jsArgs, options)

				if (!fs.existsSync(storagePath))
					fs.mkdirSync(storagePath)

				const logStream = fs.createWriteStream(logFile, { flags: 'w' })

				process.stdout.pipe(logStream)
				process.stderr.pipe(logStream)
			});
		});
	}
};

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