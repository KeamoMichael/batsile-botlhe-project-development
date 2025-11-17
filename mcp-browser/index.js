// ===============================
// MCP Browser Server - Upgraded
// ===============================

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

// ----------------------
// Global Variables
// ----------------------
let browser = null;
let page = null;
let cdpSession = null;

// ----------------------
// Helper Functions
// ----------------------
async function humanScroll(page, totalAmount) {
  let remaining = totalAmount;
  while (remaining !== 0) {
    const step =
      Math.sign(remaining) *
      Math.min(Math.abs(remaining), Math.floor(Math.random() * 50 + 20));
    await page.mouse.wheel(0, step);
    remaining -= step;
    await new Promise((r) => setTimeout(r, Math.random() * 200 + 100));
  }
}

async function humanType(page, selector, text) {
  for (const char of text) {
    await page.type(selector, char);
    await new Promise((r) => setTimeout(r, Math.random() * 150 + 50));
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
    await new Promise((r) => setTimeout(r, 50));
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
// CDP Helper Functions
// ----------------------
async function ensureCDPSession() {
  if (!cdpSession && page) {
    cdpSession = await page.context().newCDPSession(page);
  }
  return cdpSession;
}

// ----------------------
// MCP Server Setup
// ----------------------
const server = new Server(
  {
    name: "browser-mcp-server",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ----------------------
// Tool Registration
// ----------------------
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // -------- Existing Tools --------
      {
        name: "open_url",
        description: "Open a URL in the browser",
        inputSchema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
      {
        name: "scroll",
        description: "Scroll page by amount",
        inputSchema: { type: "object", properties: { amount: { type: "number" } }, required: ["amount"] },
      },
      {
        name: "hover",
        description: "Hover over element",
        inputSchema: {
          type: "object",
          properties: { selector: { type: "string" }, text: { type: "string" } },
        },
      },
      {
        name: "click",
        description: "Click on element",
        inputSchema: {
          type: "object",
          properties: { selector: { type: "string" }, text: { type: "string" } },
        },
      },
      {
        name: "type",
        description: "Type text into input",
        inputSchema: {
          type: "object",
          properties: { selector: { type: "string" }, text: { type: "string" } },
          required: ["selector", "text"],
        },
      },
      {
        name: "wait_for",
        description: "Wait for element to appear",
        inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
      },
      {
        name: "get_text",
        description: "Get text from element",
        inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
      },
      {
        name: "screenshot",
        description: "Take screenshot",
        inputSchema: {
          type: "object",
          properties: { selector: { type: "string" }, filename: { type: "string" } },
        },
      },
      // -------- New Deep Tools --------
      {
        name: "get_html",
        description: "Get inner HTML of element",
        inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
      },
      {
        name: "get_outer_html",
        description: "Get outer HTML of element",
        inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
      },
      {
        name: "get_dom_tree",
        description: "Get DOM subtree starting from selector",
        inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
      },
      {
        name: "get_bounding_box",
        description: "Get bounding box of element",
        inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
      },
      {
        name: "get_computed_style",
        description: "Get computed style of element",
        inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
      },
      {
        name: "get_all_computed_styles",
        description: "Get all computed styles for element",
        inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
      },
      {
        name: "get_event_listeners",
        description: "Get JS event listeners attached to element",
        inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
      },
      {
        name: "hover_snapshot",
        description: "Hover and capture bounding box & screenshot",
        inputSchema: { type: "object", properties: { selector: { type: "string" }, filename: { type: "string" } }, required: ["selector"] },
      },
      {
        name: "record_animation_timeline",
        description: "Record element animations over time",
        inputSchema: { type: "object", properties: { selector: { type: "string" }, duration: { type: "number" } }, required: ["selector"] },
      },
      {
        name: "compare_screenshots",
        description: "Compare two screenshots for visual diff",
        inputSchema: { type: "object", properties: { path1: { type: "string" }, path2: { type: "string" } }, required: ["path1", "path2"] },
      },
      {
        name: "extract_js_properties",
        description: "Extract JS properties and dataset attributes of element",
        inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
      },
    ],
  };
});

// ----------------------
// Tool Call Handler
// ----------------------
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!browser && name !== "open_url") {
      throw new Error("No browser open. Use open_url first.");
    }

    switch (name) {
      case "open_url": {
        if (!browser) browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        page = await context.newPage();
        await page.goto(args.url, { waitUntil: "domcontentloaded" });
        await ensureCDPSession();
        return { content: [{ type: "text", text: JSON.stringify({ status: "opened", url: args.url }) }] };
      }

      case "scroll":
        await humanScroll(page, args.amount);
        return { content: [{ type: "text", text: JSON.stringify({ status: "scrolled", amount: args.amount }) }] };

      case "hover": {
        const selector = args.selector || `:has-text("${args.text}")`;
        await humanHover(page, selector);
        await waitForAnimationsDynamic(page, selector);
        return { content: [{ type: "text", text: JSON.stringify({ status: "hovered", selector }) }] };
      }

      case "click": {
        const selector = args.selector || `:has-text("${args.text}")`;
        await page.click(selector);
        await waitForAnimationsDynamic(page, selector);
        return { content: [{ type: "text", text: JSON.stringify({ status: "clicked", selector }) }] };
      }

      case "type": {
        await humanType(page, args.selector, args.text);
        await waitForAnimationsDynamic(page, args.selector);
        return { content: [{ type: "text", text: JSON.stringify({ status: "typed", selector: args.selector, text: args.text }) }] };
      }

      case "wait_for":
        await page.waitForSelector(args.selector);
        return { content: [{ type: "text", text: JSON.stringify({ status: "found", selector: args.selector }) }] };

      case "get_text": {
        const text = await page.textContent(args.selector);
        return { content: [{ type: "text", text: JSON.stringify({ text }) }] };
      }

      case "screenshot": {
        const screenshotPath = path.resolve(args.filename || "screenshot.png");
        if (args.selector) {
          const element = page.locator(args.selector);
          await element.screenshot({ path: screenshotPath });
        } else {
          await page.screenshot({ path: screenshotPath });
        }
        return { content: [{ type: "text", text: JSON.stringify({ status: "screenshot_taken", path: screenshotPath }) }] };
      }

      // ---------------- Deep Tools Implementation ----------------

      case "get_html":
        return { content: [{ type: "text", text: JSON.stringify({ html: await page.locator(args.selector).innerHTML() }) }] };

      case "get_outer_html":
        return { content: [{ type: "text", text: JSON.stringify({ outer_html: await page.locator(args.selector).evaluate(e => e.outerHTML) }) }] };

      case "get_dom_tree":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                dom_tree: await page.locator(args.selector).evaluate(e => e.outerHTML),
              }),
            },
          ],
        };

      case "get_bounding_box":
        return { content: [{ type: "text", text: JSON.stringify({ box: await page.locator(args.selector).boundingBox() }) }] };

      case "get_computed_style":
        return { content: [{ type: "text", text: JSON.stringify({ computed: await page.locator(args.selector).evaluate(e => getComputedStyle(e)) }) }] };

      case "extract_js_properties":
        return { content: [{ type: "text", text: JSON.stringify({ properties: await page.locator(args.selector).evaluate(e => ({ ...e.dataset, ...e })) }) }] };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
  }
});

// ----------------------
// Start Server
// ----------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Browser MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
