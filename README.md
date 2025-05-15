# MCP Server - ABN Lookup Web Services

<p align="center">
  <img src="https://github.com/Himel55/abn-mcp-server/blob/main/images/logo.png" alt="MCP Server Logo" width="256" height="256">
</p>

## Overview
This **MCP Server** is a solution designed to enable AI LLMs and AI agent applications (e.g. claude desktop) to interact with the Australian Business Number (ABN) Lookup Web Services API .

## Signing Up & Obtaining ABN Web Services GUID
To access ABN Web Services, follow these steps:
1. Visit the [ABN Lookup Web Services Registration](https://abr.business.gov.au/Documentation/WebServiceRegistration) page.
2. Read and accept the web services agreement.
3. Complete the registration form.
4. Upon approval, you will receive an authentication GUID via email.

## MCP Server Services
Since MCP Server is a wrapper around the ABN Web Services API (JSON), it provides the following limited functionalities:
- **ABN Search**: Verify the existence an ABN and return information associated with the ABN.
- **ACN Search**: Verify the existence an ACN and return information associated with the ACN.
- **Business Name Lookup**: Retrieve ABN number for an entity name.

For details about the API methods, refer to the [ABN Web Services Documentation](https://abr.business.gov.au/json/).

## Setup & Integration with Claude Desktop

**Add the following to** `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "abn-mcp-server": {
      "command": "npx",
      "args": [ "-y", "@himel55/abn-mcp-server" ],
      "env": {
        "ABN_API_GUID" : "YOUR-ABN-API-GUID-HERE"
      }
    }
  }
}
```

Once configured, Claude Desktop will communicate with MCP Server to fetch ABN-related data seamlessly.

---

For further assistance, refer to the official [ABN Web Services Guide](https://abr.business.gov.au/Documentation/Default).
