import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const openCommand = 'extension.openInSystemTerminal';

  let openCommandHandler = vscode.commands.registerCommand(
    openCommand,
    async (uri?: vscode.Uri) => {
      if (!uri) {
        vscode.window.showWarningMessage(
          'Please use this command from the explorer context menu.'
        );
        return;
      }

      const terminalApp = vscode.workspace
        .getConfiguration('terminal.external')
        .get<string>('osxExec');

      try {
        const stat = await vscode.workspace.fs.stat(uri);
        const isDirectory = stat.type === vscode.FileType.Directory;
        const pathToOpen = isDirectory ? uri.fsPath : path.dirname(uri.fsPath);

        const showNotification = vscode.workspace
          .getConfiguration('open-in-system-terminal')
          .get('showNotification', true);
        if (showNotification) {
          vscode.window.showInformationMessage(
            `Opening ${pathToOpen} in ${terminalApp}...`
          );
        }

        exec(`open -a "${terminalApp}" "${pathToOpen}"`, (error) => {
          if (error) {
            vscode.window.showErrorMessage(
              `Failed to open ${terminalApp}: ${error.message}`
            );
          }
        });
      } catch (error) {
        vscode.window.showErrorMessage(
          'Error determining file type: ' + (error as Error).message
        );
      }
    }
  );

  context.subscriptions.push(openCommandHandler);
}

export function deactivate() {}
