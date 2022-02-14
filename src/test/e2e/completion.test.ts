'use strict'

import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate, sleep } from '../helper';

suite('Should do completion', async function () {

	test('Complete empty RAML file', async () => {
		const docUri = getDocUri('empty.raml');
		await testCompletion(docUri, new vscode.Position(0, 1), {
			items: [
				{ label: '#%RAML 1.0', kind: vscode.CompletionItemKind.Property }
			]
		});
	});

	test('Complete empty YAML file', async () => {
		const docUri = getDocUri('empty.yaml');
		await testCompletion(docUri, new vscode.Position(0, 1), {
			items: [
				{ label: '#%Dialect 1.0', kind: vscode.CompletionItemKind.Property },
				{ label: '#%Library / Dialect 1.0', kind: vscode.CompletionItemKind.Property },
				{ label: '#%Library / Validation Profile 1.0', kind: vscode.CompletionItemKind.Property },
				{ label: '#%Library / Vocabulary 1.0', kind: vscode.CompletionItemKind.Property },
				{ label: '#%Patch / Dialect 1.0', kind: vscode.CompletionItemKind.Property },
				{ label: '#%Patch / Validation Profile 1.0', kind: vscode.CompletionItemKind.Property },
				{ label: '#%Patch / Vocabulary 1.0', kind: vscode.CompletionItemKind.Property },
				{ label: '#%RegoValidation / Validation Profile 1.0', kind: vscode.CompletionItemKind.Property },
				{ label: '#%Validation Profile 1.0', kind: vscode.CompletionItemKind.Property },
				{ label: '#%Vocabulary 1.0', kind: vscode.CompletionItemKind.Property },
				{ label: 'asyncapi: "2.0.0"', kind: vscode.CompletionItemKind.Property },
				{ label: 'openapi: "3.0.0"', kind: vscode.CompletionItemKind.Property },
				{ label: 'swagger: "2.0"', kind: vscode.CompletionItemKind.Property }
			]
		});
	});

	test('Complete empty JSON file', async () => {
		const docUri = getDocUri('empty.json');
		await testCompletion(docUri, new vscode.Position(0, 1), {
			items: [
				{ label: '"asyncapi": "2.0.0"', kind: vscode.CompletionItemKind.Property },
				{ label: '"openapi": "3.0.0"', kind: vscode.CompletionItemKind.Property },
				{ label: '"swagger": "2.0"', kind: vscode.CompletionItemKind.Property }
			]
		});
	});

});

async function testCompletion(
	docUri: vscode.Uri,
	position: vscode.Position,
	expectedCompletionList: vscode.CompletionList
) {
	await activate(docUri);

	// Executing the command `vscode.executeCompletionItemProvider` to simulate triggering completion
	const actualCompletionList = (await vscode.commands.executeCommand(
		'vscode.executeCompletionItemProvider',
		docUri,
		position,
		""
	)) as vscode.CompletionList;

	assert.strictEqual(actualCompletionList.items.length, expectedCompletionList.items.length);
	expectedCompletionList.items.forEach((expectedItem, i) => {
		const actualItem = actualCompletionList.items[i];
		assert.strictEqual(actualItem.label, expectedItem.label);
		assert.strictEqual(actualItem.kind, expectedItem.kind);
	});
}