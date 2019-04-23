'use strict'

import * as fs from 'fs'
import * as path from 'path'
import * as net from 'net'
import * as child_process from "child_process"

import { workspace, ExtensionContext } from 'vscode'
import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient'

export function activate(context: ExtensionContext) {

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
				const jarPath = `${extensionPath}/lib/als-server.jar`
				const logFile = `${storagePath}/vscode-aml-language-server.log`

				const address = server.address()
				const port = typeof address === 'object' ? address.port : 0

				const dialectPath = `${extensionPath}/resources/dialect.yaml`

				console.log("[ALS] Extension path: " + extensionPath)
				console.log("[ALS] Storage path: " + storagePath)
				console.log("[ALS] jar path: " + jarPath)
				console.log("[ALS] Log path: " + logFile)
				console.log("[ALS] Server port: " + port)
				console.log("[ALS] java eexeec filee: " + javaExecutablePath)

				const options = { 
					cwd: workspace.rootPath,
				}

				const args = [
					'-jar',
					'-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005',
					jarPath,
					'--port',
					port.toString(),
					'--dialect',
					dialectPath,
					'--dialectProfile',
					'Mark Visit 1.0'
				]

				const process = child_process.spawn(javaExecutablePath, args, options)

				if (!fs.existsSync(storagePath))
					fs.mkdirSync(storagePath)

				const logStream = fs.createWriteStream(logFile, { flags: 'w' })

				process.stdout.pipe(logStream)
				process.stderr.pipe(logStream)
			});
		});
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [
			{ language: 'raml' },
			{ language: 'oas-yaml' },
			{ language: 'oas-json' },
			{ language: 'async-api' },
			{ language: 'mark-visit' }
		],
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
