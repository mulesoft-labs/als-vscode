'use strict'

import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate} from '../helper';
import { messages, RenameFileActionParams, RenameFileActionResult } from '../../types';

suite('Should rename file', function() {
	test('Rename file DataType.raml', async () => {
		const docUri = getDocUri('DataType.raml');
		const expectedResult: RenameFileActionResult = {
			edits: {
				documentChanges: [{
					oldUri: "file:///Users/aayerza/mulesoft/als-vscode/testFixture/DataType.raml",
					newUri: "file:///Users/aayerza/mulesoft/als-vscode/testFixture/RENAMED.raml",
					kind:"rename"
				}]
			}
		}
		await testRename(docUri, expectedResult)
	});
});

async function testRename(
	docUri: vscode.Uri,
	expected: RenameFileActionResult
) {
	const uri = docUri.toString()
	const splittedPath = uri.toString().split("/")
    const oldFileName = splittedPath[splittedPath.length - 1]
	const splittedName = uri.split(".")
    const currentExtension = splittedName[splittedName.length - 1]
    const originalPath = uri.slice(0, uri.lastIndexOf(oldFileName))

	const params: RenameFileActionParams = {
        oldDocument: { uri: docUri.toString() },
		newDocument: { uri: originalPath + "RENAMED." + currentExtension }
    };

	const languageClient = await activate(docUri)
    await (languageClient.sendRequest(messages.AlsRenameFileRequest.type, params).then(result => {
		assert.deepStrictEqual(result, expected)
    }));
}