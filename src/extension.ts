import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'open-project.open',
    async (args: { cwd: string }) => {
      if (!args || !args.cwd) {
        vscode.window.showErrorMessage('Open Project: cwd argument is required')
        return
      }

      const cwd = args.cwd.replace(/^~/, os.homedir())

      try {
        await fs.stat(cwd)
      } catch {
        vscode.window.showErrorMessage(
          `Open Project: specified path does not exist: ${cwd}`,
        )
        return
      }

      try {
        const entries = await fs.readdir(cwd, { withFileTypes: true })
        const folders = entries
          .filter((entry) => entry.isDirectory())
          .map((entry) => ({
            label: entry.name,
            path: path.join(cwd, entry.name),
          }))

        if (folders.length === 0) {
          vscode.window.showWarningMessage(
            `Open Project: No projects found in ${cwd}`,
          )
          return
        }

        const selected = await vscode.window.showQuickPick(folders, {
          placeHolder: 'Select a project to open',
        })

        if (selected) {
          await vscode.commands.executeCommand(
            'vscode.openFolder',
            vscode.Uri.file(selected.path),
          )
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Open Project: Error reading directory: ${error}`,
        )
      }
    },
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
