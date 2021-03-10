'use strict'

import * as vscode from 'vscode';
import * as path from 'path';
import * as assert from 'assert';
import { activate, forEachTestFile, getDocUri, RAML_LANGUAGE_ID } from './helper';
suite('RAML Language tests', function() {
    test('RAML Language', () => {
        test('Should be registered', () => {
            vscode.languages.getLanguages().then(langs => {
                assert.notStrictEqual(langs.indexOf(RAML_LANGUAGE_ID), -1)
            })
        })
    })

    forEachTestFile((file) => {
        test("RAML is selected language for " + file, async function() {
            await languageIsRaml(getDocUri(file))
        });
	});
});


async function languageIsRaml(docUri: vscode.Uri) {
	await activate(docUri);
	assert.strictEqual(vscode.window.activeTextEditor.document.languageId, RAML_LANGUAGE_ID);
}