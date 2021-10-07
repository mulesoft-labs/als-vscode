import * as vscode from 'vscode'

export class SettingsManager {
  constructor(private readonly reloadSettings: string[]) {
    this.reloadSettings.forEach(c => this.settingRequiresRestart(c))
  }

  settingRequiresRestart(config: string) {
    vscode.workspace.onDidChangeConfiguration(event => {
      event.affectsConfiguration(config)
      const errMsg = "AML Support configuration has changed and requires a restart.";
      const restart: string = "Restart";
      vscode.window.showInformationMessage(errMsg, restart).then(async (value?: string) => {
        if (value === restart) {
          vscode.commands.executeCommand("als.restart");
        }
      });
      
    })
  }
}