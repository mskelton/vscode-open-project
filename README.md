# VS Code Open Project

Easily open projects in VS Code from a specified root directory.

## Usage

Add keybindings to your `keybindings.json` to open the project picker:

```json
{
  "key": "cmd+shift+n",
  "command": "open-project.open",
  "args": {
    "cwd": "~/dev"
  }
}
```

## Installation

### From VSIX file

1. Download the `.vsix` file
2. Install via Command Palette: "Extensions: Install from VSIX..."
3. Or use CLI: `code --install-extension open-project-0.0.1.vsix`

### Development

1. Clone this repository
2. Run `npm install`
3. Press `F5` to launch Extension Development Host
4. Test the extension in the new VS Code window
