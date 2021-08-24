'use strict'

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { LanguageClient } from 'vscode-languageclient/node';

export let doc: vscode.TextDocument;
export let editor: vscode.TextEditor;
export let documentEol: string;
export let platformEol: string;


/**
 * Activates the extension
 */
export async function activate(docUri: vscode.Uri) {
    doc = await vscode.workspace.openTextDocument(docUri);
    try {
        editor = await vscode.window.showTextDocument(doc);
        await sleep(500); // Wait for parsing
    } catch (e) {
        console.error(e);
    }
}

export async function activateExtension(): Promise<LanguageClient> {
    // The extensionId is `publisher.name` from package.json
    await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(testFilesDirectory));

    const ext = vscode.extensions.getExtension('MuleSoftInc.aml-vscode')!;

    if (ext) {
        return await ext.activate();
    } else {
        throw new Error('Extension missing?');
    }
}

export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const forEachTestFile = (fn: (s: string) => void) => {
    fs.readdir(testFilesDirectory, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan test directory: ' + err);
        }
        files.forEach(e => fn(e))
    });
}

export const testFilesDirectory = path.join(__dirname, '../../testFixture')

export const getDocPath = (p: string) => {
    return path.resolve(testFilesDirectory, p);
};

export const getDocUri = (p: string) => {
    return vscode.Uri.file(getDocPath(p));
};

export const RAML_LANGUAGE_ID: string = "aml"
