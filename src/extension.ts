import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import { setTimeout } from 'timers/promises'
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('open-project.open', async (args: { cwd: string }) => {
      const projectPath = await selectProject(args)
      if (!projectPath) {
        return
      }

      await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath))
    }),
    vscode.commands.registerCommand(
      'open-project.open-in-new-window',
      async (args: { cwd: string }) => {
        const projectPath = await selectProject(args)
        if (!projectPath) {
          return
        }

        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), {
          forceNewWindow: true,
        })

        await setTimeout(500)
        await vscode.commands.executeCommand('workbench.action.mergeAllWindowTabs')
      },
    ),
  )
}

export function deactivate() {}

async function selectProject(args: { cwd: string }): Promise<string | undefined> {
  if (!args || !args.cwd) {
    vscode.window.showErrorMessage('Open Project: cwd argument is required')
    return
  }

  const cwd = args.cwd.replace(/^~/, os.homedir())

  try {
    await fs.stat(cwd)
  } catch {
    vscode.window.showErrorMessage(`Open Project: specified path does not exist: ${cwd}`)
    return
  }

  try {
    const entries = await fs.readdir(cwd, { withFileTypes: true })
    const items: (vscode.QuickPickItem & { path: string })[] = []

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      // Bare repo with worktrees - include subdirectories (excluding git internals)
      if (entry.name.endsWith('.git')) {
        const worktrees = await getWorktrees(path.join(cwd, entry.name))

        for (const worktree of worktrees) {
          items.push({
            description: entry.name,
            label: worktree,
            path: path.join(cwd, entry.name, worktree),
          })
        }
      } else {
        items.push({
          label: entry.name,
          path: path.join(cwd, entry.name),
        })
      }
    }

    if (items.length === 0) {
      vscode.window.showWarningMessage(`Open Project: No projects found in ${cwd}`)
      return
    }

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a project to open',
    })

    return selected?.path
  } catch (error) {
    vscode.window.showErrorMessage(`Open Project: Error reading directory: ${error}`)
  }
}

const GIT_INTERNAL_DIRS = new Set([
  'branches',
  'hooks',
  'info',
  'logs',
  'objects',
  'refs',
  'worktrees',
])

async function getWorktrees(repoPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(repoPath, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isDirectory() && !GIT_INTERNAL_DIRS.has(entry.name))
      .map((entry) => entry.name)
  } catch {
    return []
  }
}
