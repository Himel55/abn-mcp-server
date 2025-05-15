import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const ABN_LENGTH = 11
const ACN_LENGTH = 9
const ABN_API_BASE = "https://abr.business.gov.au/json";

const guid = process.env.ABN_API_GUID
if (!guid) {
  console.error("GUID environment not set! See README.")
  process.exit(1);
}

function wrapped_message(message: string): CallToolResult
{
  return {
    content: [
      {
        type: "text",
        text: `${message}`
      }
    ]
  }
}

// Helper function for making ABN API requests
async function make_request(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const body_text = await response.text();
    // Remove the "callback(" prefix and closing ")" to extract the JSON string
    return body_text.replace(/^callback\(/, '').replace(/\)$/, '');
  } catch (error) {
    console.error("Error making ABN request:", error);
    return null;
  }
}

// Create an MCP server
const server = new McpServer(
  {
    name: "abn-mcp-server",
    version: "0.0.3"
  },
  {
    capabilities: {
      tools: {},
    }
  }
);

// Tool handlers
server.tool(
  "abn-search",
  "Use the abn number provided to search for business information",
  { abn: z.string().length(ABN_LENGTH).describe("ABN number (11 digits)") },
  async({ abn }) => {
    const url = `${ABN_API_BASE}/AbnDetails.aspx?abn=${abn}&guid=${guid}`;
    const business_info = await make_request(url);
    if (!business_info) { 
      return wrapped_message("failed to retrieve data from abn server");
    }
    if (business_info.includes("not a valid")) {
      return wrapped_message("abn number is not valid");
    }
    return wrapped_message(business_info);
  }
);

server.tool(
  "acn-search",
  "Use the acn number provided to search for business information",
  { acn: z.string().length(ACN_LENGTH).describe("ACN number (9 digits)") },
  async({ acn }) => {
    const url = `${ABN_API_BASE}/AcnDetails.aspx?acn=${acn}&guid=${guid}`;
    const business_info = await make_request(url);
    if (!business_info) { 
      return wrapped_message("failed to retrieve data from acn server");
    }
    if (business_info.includes("not a valid")) {
      return wrapped_message("acn number is not valid");
    }
    return wrapped_message(business_info);
  }
);

server.tool(
  "name-search",
  "Search for ABN by entity name, returns up to 10 results",
  { name: z.string().describe("name to search") },
  async({ name }) => {
    const url = `${ABN_API_BASE}/MatchingNames.aspx?name=${encodeURIComponent(name)}&maxResults=10&guid=${guid}`;
    const results = await make_request(url);
    if (!results) { 
      return wrapped_message("failed to retrieve data from abn server");
    }
    return wrapped_message(results);
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ABN MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
