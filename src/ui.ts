import * as vscode from 'vscode';

export function awaitInputBox(startingValue: string,
    placeHolder: string,
    message: string, valueSelection?: [number, number], 
    inputValidator?: (value: string) => string | undefined) : Thenable<string>{
    const inputBoxOptions: vscode.InputBoxOptions = {
        value: startingValue,
        placeHolder: placeHolder,
        prompt: message,
        valueSelection: valueSelection,
        validateInput: inputValidator
    }

    return vscode.window.showInputBox(inputBoxOptions)
}