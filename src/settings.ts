import * as vscode from 'vscode'

export class SettingsManager {
  constructor(private readonly reloadSettings: string[]) {
    this.reloadSettings.forEach(c => this.settingRequiresRestart(c))
  }

  settingRequiresRestart(config: string) {
    vscode.workspace.onDidChangeConfiguration(event => {
      event.affectsConfiguration(config)
      const errMsg = "AML Support configuration has changed and requires a reload.";
      const reload: string = "Reload";
      vscode.window.showInformationMessage(errMsg, reload).then(async (value?: string) => {
        if (value === reload) {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
    })
  }
}