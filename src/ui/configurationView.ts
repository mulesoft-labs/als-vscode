import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LanguageClient } from 'vscode-languageclient/node';
import { AlsLanguageServer } from '../server/als';

export class ConfigurationViewProvider implements vscode.TreeDataProvider<WorkspaceConfigurationEntry> {
  constructor(private workspaces: ReadonlyArray<vscode.WorkspaceFolder>, private als: AlsLanguageServer) {}
  getTreeItem(element: WorkspaceConfigurationEntry): vscode.TreeItem {
    return element;
  }

  getChildren(element?: WorkspaceConfigurationEntry): Thenable<WorkspaceConfigurationEntry[]> {
    const p = new Promise<WorkspaceConfigurationEntry[]>(resolve => {
      if (!this.workspaces) {
        vscode.window.showInformationMessage('No workspaces');
        return resolve([]);
      }
  
      if (element) {
        return resolve([element]);
      } else {
        return Promise.all(this.workspaces.map<Promise<WorkspaceConfigurationEntry>>(async ws => {
          const config = await this.als.getWorkspaceConfiguration(ws.uri.toString(true));
          const result: WorkspaceConfigurationEntry = new WorkspaceConfigurationEntry(config.workspace, vscode.TreeItemCollapsibleState.None);
          return result;
        }))
      }
    })
    return p;

  }
 
}

class WorkspaceConfigurationEntry extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}`;
    this.description = "Test";
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}
