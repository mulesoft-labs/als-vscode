'use strict'

import * as fs from 'fs'
import * as path from 'path'
import * as net from 'net'
import * as child_process from "child_process"
import * as vscode from 'vscode';

import { window, workspace, ExtensionContext } from 'vscode'
import { LanguageClient, LanguageClientOptions, StreamInfo, InitializedNotification, StateChangeEvent, State } from 'vscode-languageclient'
import { registerCommands } from './commands'
import { notifyConfig } from './configuration'

var upath = require("upath")
const agentLibArgsDebug = '-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005'

export function activate(context: ExtensionContext) {

	const documentSelector = [
		{ language: 'raml' },
		{ language: 'oas-yaml' },
		{ language: 'oas-json' },
		{ language: 'async-api' }
	]

	function createServer(): Promise<StreamInfo> {


		return new Promise((resolve, reject) => {
			const server = net.createServer(socket => {
				console.log("[ALS] Socket created")

				resolve({
					reader: socket,
					writer: socket,
				});

				socket.on('end', () => console.log("[ALS] Disconnected"))
			}).on('error', (err) => { throw err })

			const javaExecutablePath = findJavaExecutable('java');
			server.listen(() => {
				const extensionPath = context.extensionPath
				const storagePath = context.storagePath || context.globalStoragePath
				// const jarPath = `/Users/llibarona/mulesoft/als/als-server/jvm/target/scala-2.12/als-server-assembly-3.3.0-SNAPSHOT.jar`
				// const jarPath =  `${extensionPath}/lib/als-server.jar`

				const logFile = `/Users/llibarona/mulesoft/als-vscode/als.log`

				const jsPath = '/Users/llibarona/mulesoft/als/als-node-client/node-package/dist/als-node-client.js'
				// const jsPath = '/Users/llibarona/mulesoft/als/als-node-client/target/scala-2.12/als-node-client-fastopt.js'
				// const options = { 
				// 	cwd: '/Users/jisoldi/MuleSoft/als/als-server/js/',
				// }
				const options = { 
					cwd: workspace.rootPath,
				}
				const address = server.address()
				const port = typeof address === 'object' ? address.port : 0

				const dialectPath = `${withRootSlash(upath.toUnix(extensionPath))}/resources/dialect.yaml`

				console.log("[ALS] Extension path: " + extensionPath)
				console.log("[ALS] Dialect path: " + dialectPath)
				console.log("[ALS] Storage path: " + storagePath)
				// console.log("[ALS] jar path: " + jarPath)
				console.log("[ALS] js path: " + jsPath)
				console.log("[ALS] Log path: " + logFile)
				console.log("[ALS] Server port: " + port)
				console.log("[ALS] java exec file: " + javaExecutablePath)
				
				const args = [ jsPath, '--port', port.toString() ]
				// const args = [
				// 	'-jar',
				// 	agentLibArgsDebug,
				// 	jarPath,
				// 	'--port',
				// 	port.toString()
				// ]
				console.log("[ALS] Spawning at port: " + port);
				// const process = child_process.spawn(javaExecutablePath, args, options)
				const process = child_process.spawn('node', args, options)

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

	context.subscriptions.push(disposable)
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