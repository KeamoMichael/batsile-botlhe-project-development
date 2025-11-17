# MCP Browser Server Setup Instructions

## What's Been Done

1. ✅ Installed dependencies (`playwright` and `@modelcontextprotocol/sdk`)
2. ✅ Rewritten the server to use the proper MCP protocol
3. ✅ Updated configuration file with absolute path

## How to Configure Cursor

The MCP server configuration needs to be added to Cursor's settings. Here's how:

### Option 1: Via Cursor Settings UI

1. Open Cursor
2. Go to **Settings** (Ctrl+, or Cmd+,)
3. Search for "MCP" or "Model Context Protocol"
4. Add the following configuration:

```json
{
  "mcpServers": {
    "browser": {
      "command": "node",
      "args": ["\\\\Mac\\Home\\Documents\\Web Development\\ayanda-dlamini\\mcp-browser\\index.js"]
    }
  }
}
```

### Option 2: Via Settings JSON File

1. Open Cursor
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Preferences: Open User Settings (JSON)"
4. Add the MCP configuration to your settings file

The configuration should be placed in your Cursor settings file, typically located at:
- **Windows**: `%APPDATA%\Cursor\User\settings.json`
- **macOS**: `~/Library/Application Support/Cursor/User/settings.json`
- **Linux**: `~/.config/Cursor/User/settings.json`

## Verify Installation

After adding the configuration:

1. **Restart Cursor** completely
2. The MCP server should automatically start when Cursor launches
3. You can verify it's working by checking Cursor's MCP server status in the settings

## Available Tools

Once configured, the following browser tools will be available:

- `open_url` - Open a URL in the browser
- `scroll` - Scroll the page
- `hover` - Hover over elements
- `click` - Click on elements
- `type` - Type text into input fields
- `wait_for` - Wait for elements to appear
- `get_text` - Get text content from elements
- `screenshot` - Take screenshots

## Troubleshooting

If the tools don't work:

1. **Check Node.js is installed**: Run `node --version` in terminal
2. **Verify dependencies**: Run `cd mcp-browser && npm install`
3. **Check the path**: Make sure the path in the configuration matches your actual file location
4. **Check Cursor logs**: Look for MCP server errors in Cursor's developer console (Help > Toggle Developer Tools)

## Testing the Server Manually

You can test the server directly (though it won't work interactively since it uses stdio):

```bash
cd mcp-browser
node index.js
```

The server should start and wait for MCP protocol messages on stdin/stdout.


