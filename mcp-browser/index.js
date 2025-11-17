import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

let browser = null;
let page = null;

// ----------------------
// Helper Functions
// ----------------------
async function humanScroll(page, totalAmount) {
  let remaining = totalAmount;
  while (remaining !== 0) {
    const step = Math.sign(remaining) * Math.min(Math.abs(remaining), Math.floor(Math.random() * 50 + 20));
    await page.mouse.wheel(0, step);
    remaining -= step;
    await new Promise(r => setTimeout(r, Math.random() * 200 + 100));
  }
}

async function humanType(page, selector, text) {
  for (const char of text) {
    await page.type(selector, char);
    await new Promise(r => setTimeout(r, Math.random() * 150 + 50));
  }
}

async function humanHover(page, selector) {
  const element = page.locator(selector);
  const box = await element.boundingBox();
  if (!box) return;
  const steps = 10;
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  for (let i = 0; i < steps; i++) {
    await page.mouse.move(
      startX + Math.random() * 5 - 2.5,
      startY + Math.random() * 5 - 2.5
    );
    await new Promise(r => setTimeout(r, 50));
  }
}

async function waitForAnimationsDynamic(page, selector) {
  const element = page.locator(selector);
  let prevBox = await element.boundingBox();
  if (!prevBox) return;
  let stable = false;
  while (!stable) {
    await page.waitForTimeout(50);
    const currBox = await element.boundingBox();
    if (
      currBox &&
      Math.abs(currBox.x - prevBox.x) < 1 &&
      Math.abs(currBox.y - prevBox.y) < 1 &&
      Math.abs(currBox.width - prevBox.width) < 1 &&
      Math.abs(currBox.height - prevBox.height) < 1
    ) {
      stable = true;
    } else {
      prevBox = currBox;
    }
  }
}

// ----------------------
// MCP Server Setup
// ----------------------
const server = new Server(
  {
    name: "browser-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "open_url",
        description: "Open a URL in the browser",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to open",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "scroll",
        description: "Scroll the page by a specified amount",
        inputSchema: {
          type: "object",
          properties: {
            amount: {
              type: "number",
              description: "Amount to scroll (positive = down, negative = up)",
            },
          },
          required: ["amount"],
        },
      },
      {
        name: "hover",
        description: "Hover over an element by selector or text",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "CSS selector for the element",
            },
            text: {
              type: "string",
              description: "Text content to find the element",
            },
          },
        },
      },
      {
        name: "click",
        description: "Click on an element by selector or text",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "CSS selector for the element",
            },
            text: {
              type: "string",
              description: "Text content to find the element",
            },
          },
        },
      },
      {
        name: "type",
        description: "Type text into an element",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "CSS selector for the input element",
            },
            text: {
              type: "string",
              description: "Text to type",
            },
          },
          required: ["selector", "text"],
        },
      },
      {
        name: "wait_for",
        description: "Wait for an element to appear",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "CSS selector to wait for",
            },
          },
          required: ["selector"],
        },
      },
      {
        name: "get_text",
        description: "Get text content from an element",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "CSS selector for the element",
            },
          },
          required: ["selector"],
        },
      },
      {
        name: "screenshot",
        description: "Take a screenshot of the page or element",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "Optional CSS selector for element screenshot",
            },
            filename: {
              type: "string",
              description: "Filename for the screenshot",
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "open_url": {
        if (!browser) browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        page = await context.newPage();
        await page.goto(args.url, { waitUntil: 'domcontentloaded' });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ status: "opened", url: args.url }),
            },
          ],
        };
      }

      case "scroll": {
        if (!page) throw new Error("No page open. Use open_url first.");
        await humanScroll(page, args.amount);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ status: "scrolled", amount: args.amount }),
            },
          ],
        };
      }

      case "hover": {
        if (!page) throw new Error("No page open. Use open_url first.");
        const targetSelector = args.selector || `:has-text("${args.text}")`;
        await humanHover(page, targetSelector);
        await waitForAnimationsDynamic(page, targetSelector);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ status: "hovered", selector: targetSelector }),
            },
          ],
        };
      }

      case "click": {
        if (!page) throw new Error("No page open. Use open_url first.");
        const targetSelector = args.selector || `:has-text("${args.text}")`;
        await page.click(targetSelector);
        await waitForAnimationsDynamic(page, targetSelector);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ status: "clicked", selector: targetSelector }),
            },
          ],
        };
      }

      case "type": {
        if (!page) throw new Error("No page open. Use open_url first.");
        await humanType(page, args.selector, args.text);
        await waitForAnimationsDynamic(page, args.selector);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ status: "typed", selector: args.selector, text: args.text }),
            },
          ],
        };
      }

      case "wait_for": {
        if (!page) throw new Error("No page open. Use open_url first.");
        await page.waitForSelector(args.selector);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ status: "found", selector: args.selector }),
            },
          ],
        };
      }

      case "get_text": {
        if (!page) throw new Error("No page open. Use open_url first.");
        const text = await page.textContent(args.selector);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ text }),
            },
          ],
        };
      }

      case "screenshot": {
        if (!page) throw new Error("No page open. Use open_url first.");
        const screenshotPath = path.resolve(args.filename || 'screenshot.png');
        if (args.selector) {
          const element = page.locator(args.selector);
          await element.screenshot({ path: screenshotPath });
        } else {
          await page.screenshot({ path: screenshotPath });
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ status: "screenshot_taken", path: screenshotPath }),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: error.message }),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Browser MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
