# MCP Markdown Rules - Basic Usage Example

This example demonstrates the basic usage of the MCP Markdown Rules.

## Installation

```bash
npm install mcp-markdown-rules
```

## Usage

### 1. Using npx (Recommended)

```bash
# Basic server
npx mcp-markdown-rules

# With file watching
npx mcp-markdown-rules --watch

# With keyboard interface
npx mcp-markdown-rules --keyboard

# With both features
npx mcp-markdown-rules --watch --keyboard

# With custom rules directory
npx mcp-markdown-rules --rules-dir ./my-rules

# Show help
npx mcp-markdown-rules --help
```

### 2. Using as a library

```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create MCP server
const server = new Server({
  name: 'my-project-rules',
  version: '1.0.0',
  description: 'My project rules server',
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 3. Getting project rules

```javascript
// Client request for rules
const response = await server.handleRequest({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'get_project_rules',
    arguments: {
      rule_type: 'GENERAL-OVERVIEW',
    },
  },
});

console.log(response.result.content[0].text);
```

## Available Rule Types

- `GENERAL-OVERVIEW`: Project common rules overview
- `GENERAL-COMMIT-MESSAGES`: Commit message rules
- `ALL`: Get all rules at once

## Command Line Options

- `--watch` / `-w`: Enable file watching for rule changes
- `--keyboard` / `-k`: Enable keyboard interface (q=quit, r=restart)
- `--rules-dir <path>` / `-r <path>`: Specify custom rules directory path
- `--help` / `-h`: Show help message
