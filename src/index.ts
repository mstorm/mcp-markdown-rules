#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, readdirSync, existsSync, watch } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    watch: false,
    keyboard: false,
    help: false,
    rulesDir: process.env.MCP_RULES_DIR || './rules', // Default to './rules'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--keyboard':
      case '-k':
        options.keyboard = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--rules-dir':
      case '-r':
        if (i + 1 < args.length) {
          const nextArg = args[i + 1];
          if (nextArg && !nextArg.startsWith('-')) {
            options.rulesDir = nextArg;
            i++; // Skip next argument as it's the directory path
          } else {
            console.error('Error: --rules-dir requires a directory path');
            process.exit(1);
          }
        } else {
          console.error('Error: --rules-dir requires a directory path');
          process.exit(1);
        }
        break;
    }
  }

  return options;
}

// Show help message
function showHelp() {
  console.log(`
Usage: node dist/index.js [options]

Options:
  -w, --watch              Enable file watching for rule changes
  -k, --keyboard           Enable keyboard interface (q=quit, r=restart)
  -r, --rules-dir <path>   Specify custom rules directory path
  -h, --help               Show this help message

Examples:
  node dist/index.js                                    # Basic server
  node dist/index.js --watch                            # With file watching
  node dist/index.js --keyboard                         # With keyboard interface
  node dist/index.js --watch --keyboard                 # With both features
  node dist/index.js --rules-dir /path/to/rules         # Custom rules directory
  node dist/index.js --rules-dir ./custom-rules --watch # Custom dir + watching
`);
  process.exit(0);
}

// Server configuration (customizable via environment variables)
const SERVER_CONFIG = {
  name: process.env.MCP_SERVER_NAME || 'project-rules',
  version: process.env.MCP_SERVER_VERSION || '1.0.0',
  description:
    process.env.MCP_SERVER_DESCRIPTION || 'MCP server for project rules',
};

// Create MCP server
const server = new Server(SERVER_CONFIG);

// Rules cache
let rulesCache: Record<string, string> = {};
let lastScanTime = 0;
let globalWatcher: ReturnType<typeof watch>; // To store the watcher for keyboard interface

// Function to dynamically read project rule files
function getProjectRules(): Record<string, string> {
  const currentDir = new URL('.', import.meta.url).pathname;
  const rulesDir = options.rulesDir || join(currentDir, '..', 'rules');
  const rules: Record<string, string> = {};

  try {
    // Check if rules directory exists
    if (!existsSync(rulesDir)) {
      console.error('Rules directory not found:', rulesDir);
      return rules;
    }

    // Read directory entries
    const entries = readdirSync(rulesDir, { withFileTypes: true });

    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        const toolDir = join(rulesDir, entry.name);
        const toolName = entry.name.toUpperCase();

        try {
          // Read files from each tool directory
          const toolFiles = readdirSync(toolDir);

          toolFiles.forEach((file) => {
            if (file.endsWith('.md')) {
              const filePath = join(toolDir, file);
              const content = readFileSync(filePath, 'utf-8');

              // README.md becomes OVERVIEW, others keep their filename (without extension)
              const key =
                file === 'README.md'
                  ? `${toolName}-OVERVIEW`
                  : `${toolName}-${file.replace('.md', '').toUpperCase()}`;

              rules[key] = content;
            }
          });
        } catch (error) {
          console.error(`Error reading tool directory ${entry.name}:`, error);
        }
      }
    });
  } catch (error) {
    console.error('Error reading rules files:', error);
  }

  return rules;
}

// Function to return cached rules (performance optimization)
function getCachedProjectRules(): Record<string, string> {
  const now = Date.now();

  // Rescan if cache is empty or 5 seconds have passed
  if (
    !rulesCache ||
    Object.keys(rulesCache).length === 0 ||
    now - lastScanTime > 5000
  ) {
    console.log('🔄 Rescanning rules...');
    rulesCache = getProjectRules();
    lastScanTime = now;
    console.log(`✅ ${Object.keys(rulesCache).length} rules loaded`);
  }

  return rulesCache;
}

// File change detection and rules reload
function setupFileWatcher() {
  const currentDir = new URL('.', import.meta.url).pathname;
  const rulesDir = options.rulesDir || join(currentDir, '..', 'rules');

  if (!existsSync(rulesDir)) {
    console.error('Rules directory not found for watching:', rulesDir);
    return;
  }

  console.log('👀 Starting file change detection:', rulesDir);

  // Watch rules directory
  const watcher = watch(
    rulesDir,
    { recursive: true },
    (eventType, filename) => {
      if (filename && filename.endsWith('.md')) {
        console.log(`📝 File change detected: ${filename} (${eventType})`);

        // Invalidate cache for rescan on next request
        rulesCache = {};
        lastScanTime = 0;

        console.log('🔄 Rules cache invalidated');
      }
    }
  );

  // Store watcher reference for keyboard interface
  globalWatcher = watcher;

  // Clean up watcher on process exit
  process.on('exit', () => {
    watcher.close();
  });

  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    watcher.close();
    process.exit(0);
  });

  return watcher;
}

// Function to dynamically generate available rule types
function getAvailableRuleTypes(): string[] {
  const rules = getCachedProjectRules();
  return Object.keys(rules).concat(['ALL']);
}

// Provide tool list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const availableRuleTypes = getAvailableRuleTypes();

  return {
    tools: [
      {
        name: 'get_project_rules',
        description: 'Get project rules',
        inputSchema: {
          type: 'object',
          properties: {
            rule_type: {
              type: 'string',
              enum: availableRuleTypes,
              description: 'Type of rule to retrieve',
            },
          },
          required: ['rule_type'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'get_project_rules') {
    if (!args || typeof args !== 'object' || !('rule_type' in args)) {
      throw new Error('rule_type argument is required');
    }

    const ruleType = args.rule_type as string;
    const rules = getCachedProjectRules();

    if (ruleType === 'ALL') {
      return {
        content: [
          {
            type: 'text',
            text: Object.entries(rules)
              .map(([key, value]) => `## ${key}\n\n${value}`)
              .join('\n\n---\n\n'),
          },
        ],
      };
    } else if (rules[ruleType]) {
      return {
        content: [
          {
            type: 'text',
            text: rules[ruleType],
          },
        ],
      };
    } else {
      throw new Error(`Unknown rule type: ${ruleType}`);
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Setup keyboard interface
function setupKeyboardInterface() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  console.log('\n⌨️  Keyboard controls:');
  console.log('   q - Quit server');
  console.log('   r - Restart server');
  console.log('   Press any key to continue...\n');

  rl.on('line', (input) => {
    const key = input.trim().toLowerCase();

    switch (key) {
      case 'q':
        console.log('\n🛑 Quitting server...');
        if (globalWatcher) {
          globalWatcher.close();
        }
        rl.close();
        process.exit(0);
        break;

      case 'r':
        console.log('\n🔄 Restarting server...');
        if (globalWatcher) {
          globalWatcher.close();
        }
        // Clear cache and restart file watcher
        rulesCache = {};
        lastScanTime = 0;
        if (globalWatcher) {
          setupFileWatcher();
        }
        console.log('✅ Server restarted');
        break;

      default:
        // Ignore other keys
        break;
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down...');
    if (globalWatcher) {
      globalWatcher.close();
    }
    rl.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    if (globalWatcher) {
      globalWatcher.close();
    }
    rl.close();
    process.exit(0);
  });
}

// Parse command line arguments
const options = parseArguments();

// Show help if requested
if (options.help) {
  showHelp();
}

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
console.log(
  `${SERVER_CONFIG.name} MCP Server started (v${SERVER_CONFIG.version})`
);

// Setup file change detection based on command line options
if (options.watch) {
  setupFileWatcher();
  console.log('👀 File change detection enabled');
} else {
  console.log('📁 File change detection disabled (use --watch to enable)');
}

// Setup keyboard interface based on command line options
if (options.keyboard) {
  setupKeyboardInterface();
  console.log('⌨️  Keyboard interface enabled');
} else {
  console.log('⌨️  Keyboard interface disabled (use --keyboard to enable)');
}
