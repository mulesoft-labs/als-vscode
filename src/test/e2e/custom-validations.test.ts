'use strict'

import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate, activateExtension, sleep, restartAls } from '../helper';
import { ExecuteCommandRequest } from 'vscode-languageclient';

suite('Custom Validations', async function () {
	this.beforeAll(async () => {
		const config = vscode.workspace.getConfiguration(`amlLanguageServer.run`)
		await config.update("configurationStyle", "command");
		await restartAls();
	})
	this.afterAll(async () => {
		const config = vscode.workspace.getConfiguration(`amlLanguageServer.run`)
		await config.update("configurationStyle", "file");
		await restartAls();
	})
	test('Custom validation on RAML file', async () => {
		await testDiagnostics(getDocUri('profile-api.raml'), getDocUri('profile.yaml'), [
			{ message: 'Payload media type is mandatory', range: toLspRange(20, 5, 21, 15), severity: vscode.DiagnosticSeverity.Error, source: 'ex' },
			{ message: "Unresolved reference 'st'", range: toLspRange(21, 13, 21, 15), severity: vscode.DiagnosticSeverity.Error, source: 'ex' },
			{ message: 'maximum number of endpoints test', range: toLspRange(2, 1, 21, 15), severity: vscode.DiagnosticSeverity.Error, source: 'ex' }
		]);
	});

	test('Custom validation on OAS3 file', async () => {
		await testDiagnostics(getDocUri('oas-profile.json'), getDocUri('profile.yaml'), [
			{ message: 'maximum number of endpoints test', range: toLspRange(1, 1, 9, 2), severity: vscode.DiagnosticSeverity.Error, source: 'ex' },
			{ message: "Info object 'title' must be a single value", range: toLspRange(1, 1, 9, 2), severity: vscode.DiagnosticSeverity.Error, source: 'ex' },
			{ message: "Version is mandatory in Info object", range: toLspRange(1, 1, 9, 2), severity: vscode.DiagnosticSeverity.Error, source: 'ex' }
		]);
	});

	test('Custom validation test severities', async () => {
		await testDiagnostics(getDocUri('severity.raml'), getDocUri('severities-profile.yaml'), [
			{ message: 'Info', range: toLspRange(6, 7, 6, 9), severity: vscode.DiagnosticSeverity.Information, source: 'ex' },
			{ message: "Warning", range: toLspRange(6, 7, 6, 9), severity: vscode.DiagnosticSeverity.Warning, source: 'ex' },
			{ message: "Violation", range: toLspRange(6, 7, 6, 9), severity: vscode.DiagnosticSeverity.Error, source: 'ex' }
		]);
	});

});

function toLspRange(sLine: number, sChar: number, eLine: number, eChar: number) {
	const start = new vscode.Position(sLine - 1, sChar - 1);
	const end = new vscode.Position(eLine - 1, eChar - 1);
	return new vscode.Range(start, end);
}

async function testDiagnostics(docUri: vscode.Uri, profile: vscode.Uri, expectedDiagnostics: vscode.Diagnostic[]) {
	const languageClient = await activateExtension();
	const prevDiagnostics = vscode.languages.getDiagnostics(docUri);
	await activate(docUri).then(async () => {
		// register profile
		await (languageClient.sendRequest(ExecuteCommandRequest.type, {
			command: 'didChangeConfiguration',
			arguments: [
				{ mainUri: "", folder: docUri.toString(true), dependencies: [], customValidationProfiles: [profile.toString(true)] },
			],
		}))
	})

	// force parsing by changing the file
	const edit = new vscode.WorkspaceEdit()
	edit.insert(docUri, new vscode.Position(0, 0), "\n")
	await vscode.workspace.applyEdit(edit)
	const undo = new vscode.WorkspaceEdit()
	undo.replace(docUri, toLspRange(1, 1, 2, 1), "")
	await vscode.workspace.applyEdit(undo)

	// execute test
	await getDiagnostics(docUri, prevDiagnostics.length, expectedDiagnostics)

	// unregister profile
	await (languageClient.sendRequest(ExecuteCommandRequest.type, {
		command: 'didChangeConfiguration',
		arguments: [
			{ mainUri: "", folder: docUri.toString(true), dependencies: [], customValidationProfiles: [] },
		],
	}))

}

async function getDiagnostics(docUri: vscode.Uri, diagnosticsLengthBeforeProfile: number, expectedDiagnostics: vscode.Diagnostic[]) {
	const actualDiagnostics = vscode.languages.getDiagnostics(docUri);
	if (actualDiagnostics.length == diagnosticsLengthBeforeProfile) {
		await sleep(100);
		return getDiagnostics(docUri, diagnosticsLengthBeforeProfile, expectedDiagnostics)
	} else {
		if(actualDiagnostics.length != expectedDiagnostics.length){
			console.log(actualDiagnostics);
		}
		assert.strictEqual(actualDiagnostics.length, expectedDiagnostics.length);
		expectedDiagnostics.forEach((expectedDiagnostic, i) => {
			const diagnostic = actualDiagnostics.find(e => e.message == expectedDiagnostic.message)
			assert.strictEqual(diagnostic.message, expectedDiagnostic.message);
			assert.deepStrictEqual(diagnostic.range, expectedDiagnostic.range);
			assert.strictEqual(diagnostic.severity, expectedDiagnostic.severity);
		});
	}
}