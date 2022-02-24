import * as vscode from 'vscode';
import * as path from 'path';
import { AlsLanguageClient } from '../server/als';
import { isDependencyConfiguration } from '../types';
import { AlsDependency, Dependency, GetWorkspaceConfigurationResult } from '@mulesoft/anypoint-node-client';

export class ConfigurationViewProvider implements vscode.TreeDataProvider<WorkspaceConfigurationEntry> {
  constructor(private workspaces: ReadonlyArray<vscode.WorkspaceFolder>, private als: AlsLanguageClient) { }

  getTreeItem(element: WorkspaceConfigurationEntry): vscode.TreeItem {
    return element;
  }

  getChildren(element?: WorkspaceConfigurationEntry): Thenable<WorkspaceConfigurationEntry[]> {
    const p = new Promise<WorkspaceConfigurationEntry[]>(resolve => {
      if (!this.workspaces) {
        vscode.window.showInformationMessage('No workspaces');
        return resolve([]);
      }

      if (!this.als.ready()) {
        vscode.window.showInformationMessage('ALS not ready yet');
        return resolve([]);
      }

      if (element && element instanceof WorkspaceConfigurationParent) {
        const result = new Array<WorkspaceConfigurationEntry>()
        if (element.configuration.configuration.mainPath != "") {
          result.push(new MainFileEntry(element.configuration.configuration.mainPath))
        }
        if (element.configuration.configuration.dependencies.filter(isDependencyConfiguration).filter(v => v.scope == "custom-validation").length > 0) {
          result.push(new DependencyHolderEntry("Profiles", vscode.TreeItemCollapsibleState.Collapsed, element.configuration))
        }
        if (element.configuration.configuration.dependencies.filter(isDependencyConfiguration).filter(v => v.scope == "semantic-extension").length > 0) {
          result.push(new DependencyHolderEntry("Extensions", vscode.TreeItemCollapsibleState.Collapsed, element.configuration))
        }
        return resolve(result);
      } else if (element && element instanceof DependencyHolderEntry && element.label == "Profiles") {
        return resolve(element.configuration.configuration.dependencies.filter(isDependencyConfiguration).filter(v => v.scope == "custom-validation").map(profile => {
          return new DependencyEntryBuilder(profile, vscode.TreeItemCollapsibleState.Expanded, element.configuration).build();
        }))
      } else if (element && element instanceof DependencyHolderEntry && element.label == "Extensions") {
        return resolve(element.configuration.configuration.dependencies.filter(isDependencyConfiguration).filter(v => v.scope == "semantic-extension").map(profile => {
          return new DependencyEntryBuilder(profile, vscode.TreeItemCollapsibleState.Expanded, element.configuration).build();
        }))
      } else {
        return resolve(Promise.all(this.workspaces.map<Promise<WorkspaceConfigurationEntry>>(async ws => {
          const config = await this.als.getWorkspaceConfiguration(ws.uri.toString(true));
          console.log(config)
          const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(config.workspace))
          const workspaceName = workspaceFolder ? workspaceFolder.name : config.workspace.split("/")[config.workspace.split("/").length - 1];
          const result: WorkspaceConfigurationEntry = new WorkspaceConfigurationParent(workspaceName, vscode.TreeItemCollapsibleState.Collapsed, config);
          return result;
        })))
      }
    })
    return p;

  }

  private _onDidChangeTreeData: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();

  readonly onDidChangeTreeData: vscode.Event<undefined> = this._onDidChangeTreeData.event;

  refresh(workspaces: ReadonlyArray<vscode.WorkspaceFolder>): void {
    this.workspaces = workspaces;
    this._onDidChangeTreeData.fire(undefined);
  }

}

class WorkspaceConfigurationEntry extends vscode.TreeItem {
  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'folder.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'folder.svg')
  };
}

class WorkspaceConfigurationParent extends WorkspaceConfigurationEntry {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly configuration: GetWorkspaceConfigurationResult,
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.configuration.workspace}`;
    this.description = this.configuration.workspace;
  }
}

class DependencyHolderEntry extends WorkspaceConfigurationEntry {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly configuration: GetWorkspaceConfigurationResult
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}`;
    this.description = "";
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'gear.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'gear.svg')
  };
}

class DependencyEntryBuilder {
  constructor(
    public readonly dependency: AlsDependency,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly configuration: GetWorkspaceConfigurationResult
  ) { }

  build = () => {
    const fullPath = (isDependencyConfiguration(this.dependency)) ? this.dependency.file : this.dependency;
    const shortPath = fullPath.replace(this.configuration.workspace + path.sep, "")
    return new DependencyEntry(fullPath, shortPath, vscode.TreeItemCollapsibleState.None, this.configuration)
  }

}

class DependencyEntry extends WorkspaceConfigurationEntry {
  constructor(
    readonly fullPath: string,
    public readonly shortPath: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly configuration: GetWorkspaceConfigurationResult
  ) {
    super(shortPath, collapsibleState);
    this.tooltip = fullPath;
    this.description = fullPath;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'gear.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'gear.svg')
  };
}


class MainFileEntry extends WorkspaceConfigurationEntry {
  constructor(
    public readonly uri: string
  ) {
    super("Main file: " + uri, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `${this.uri}`;
    this.description = this.uri;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'file.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'file.svg')
  };
}
