import { RequestType, RequestType0, TextDocumentIdentifier, RenameFile, TextDocumentEdit } from "vscode-languageclient"
import { Interface } from "readline";

export interface RenameFileActionParams {
    oldDocument: TextDocumentIdentifier,
    newDocument: TextDocumentIdentifier
 }

 export interface RenameFileActionResult {
     rename: RenameFile,
     textEdits: TextDocumentEdit[]
 }


