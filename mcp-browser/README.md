# MCP Browser Server

A Model Context Protocol (MCP) server that provides browser automation tools using Playwright.

## Quick Setup

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
cd mcp-browser
npm install
npx playwright install chromium
```

### 2. Configure Cursor

**Important**: The `cursor.json` file in this directory is a template. You need to add this configuration to Cursor's actual settings.

#### Method 1: Copy to Cursor Settings

1. Open Cursor Settings (Ctrl+,)
2. Search for "MCP" 
3. Add the MCP server configuration

#### Method 2: Edit Settings JSON

1. Press `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"
2. Add this configuration (update the path to match your actual file location):

```json
{
  "mcpServers": {
    "browser": {
      "command": "node",
      "args": ["C:\\full\\path\\to\\mcp-browser\\index.js"]
    }
  }
}
```

**Note**: Replace the path with your actual absolute path. If you're on a network drive (UNC path like `\\Mac\...`), you may need to map it to a drive letter first, or use the full UNC path format.

### 3. Restart Cursor

After adding the configuration, completely restart Cursor for the MCP server to be recognized.

## Available Tools

- `open_url` - Navigate to a URL
- `scroll` - Scroll the page
- `hover` - Hover over elements
- `click` - Click elements
- `type` - Type into input fields
- `wait_for` - Wait for elements
- `get_text` - Extract text content
- `screenshot` - Capture screenshots

## Troubleshooting

### Server Not Starting

1. Verify Node.js is installed: `node --version`
2. Check the path in Cursor settings matches your actual file location
3. Ensure all dependencies are installed: `cd mcp-browser && npm install`

### UNC Path Issues

If your project is on a network path (`\\Mac\...`), Windows may have issues. Solutions:

1. Map the network drive to a letter (e.g., `Z:`)
2. Use the mapped drive path in the configuration
3. Or use the full UNC path with proper escaping

### Browser Not Launching

Run `npx playwright install chromium` to ensure Playwright browsers are installed.


