'use strict'

import * as vscode from 'vscode';
import * as path from 'path';
import * as assert from 'assert';
import { activate, forEachTestFile, getDocUri, AML_LANGUAGE_ID, AML_JSON_LANGUAGE_ID } from './helper';
suite('AML Language tests', function () {
    test('Should be registered', () => {
        vscode.languages.getLanguages().then(langs => {
            assert.notStrictEqual(langs.indexOf(AML_LANGUAGE_ID), -1)
        })
    })

    forEachTestFile((file) => {
        test("AML is selected language for " + file, async function () {
            await languageIsRaml(getDocUri(file))
        });
    });
});


async function languageIsRaml(docUri: vscode.Uri) {
    await activate(docUri);
    if(docUri.path.endsWith(".json"))
        assert.strictEqual(vscode.window.activeTextEditor.document.languageId, AML_JSON_LANGUAGE_ID);
    else
        assert.strictEqual(vscode.window.activeTextEditor.document.languageId, AML_LANGUAGE_ID);
}