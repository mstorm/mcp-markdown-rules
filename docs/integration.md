# MCP Markdown Rules - Integration Examples

This example demonstrates how to integrate the MCP Markdown Rules with other systems and frameworks.

## 1. Integration with Node.js Applications

### Express.js Server Integration

```javascript
import express from 'express';
import { spawn } from 'child_process';

const app = express();
const PORT = process.env.PORT || 3000;

// Start MCP server process
const mcpServer = spawn(
  'npx',
  ['mcp-markdown-rules', '--rules-dir', './company-rules'],
  {
    stdio: ['pipe', 'pipe', 'pipe'],
  }
);

// Function to communicate with MCP server
async function getProjectRules(ruleType) {
  return new Promise((resolve, reject) => {
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'get_project_rules',
        arguments: { rule_type: ruleType },
      },
    };

    mcpServer.stdin.write(JSON.stringify(request) + '\n');

    mcpServer.stdout.once('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        resolve(response.result);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// API endpoint
app.get('/api/rules/:type', async (req, res) => {
  try {
    const ruleType = req.params.type;
    const rules = await getProjectRules(ruleType);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 2. Integration with CI/CD Pipelines

### GitHub Actions Example

```yaml
name: Validate Project Rules

on:
  pull_request:
    branches: [main, develop]

jobs:
  validate-rules:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Validate rules
        run: |
          # Start MCP server in background
          npx mcp-rules-server --rules-dir ./project-rules &
          MCP_PID=$!

          # Wait for server to start
          sleep 2

          # Validate rules
          curl -X GET http://localhost:3000/api/rules/ALL

          # Stop MCP server
          kill $MCP_PID
```

## 3. Integration with Docker

### Dockerfile Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build
RUN pnpm run build

# Create rules directory mount point
RUN mkdir -p /rules

# Set environment variable
ENV MCP_RULES_DIR=/rules

# Expose port
EXPOSE 3000

# Run
CMD ["npx", "mcp-rules-server", "--rules-dir", "/rules"]
```

### docker-compose.yml Example

```yaml
version: '3.8'

services:
  mcp-server:
    build: .
    ports:
      - '3000:3000'
    volumes:
      - ./company-rules:/rules
    environment:
      - MCP_RULES_DIR=/rules
    restart: unless-stopped
```

## 4. Integration with Monitoring

### Health Check Endpoint

```javascript
// Health check function
async function checkMCPServerHealth() {
  try {
    const rules = await getProjectRules('GENERAL-OVERVIEW');
    return {
      status: 'healthy',
      rulesCount: Object.keys(rules).length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Health check API
app.get('/health', async (req, res) => {
  const health = await checkMCPServerHealth();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## 5. Integration with Logging

### Winston Logger Integration

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'mcp-server.log' }),
    new winston.transports.Console(),
  ],
});

// Handle MCP server logs
mcpServer.stdout.on('data', (data) => {
  logger.info('MCP Server output', { output: data.toString().trim() });
});

mcpServer.stderr.on('data', (data) => {
  logger.error('MCP Server error', { error: data.toString().trim() });
});
```

## 6. Integration with Testing

### Jest Test Example

```javascript
import { spawn } from 'child_process';

describe('MCP Server Integration', () => {
  let mcpServer;

  beforeAll(async () => {
    mcpServer = spawn('npx', [
      'mcp-rules-server',
      '--rules-dir',
      './test-rules',
    ]);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(() => {
    mcpServer.kill();
  });

  test('should load rules from custom directory', async () => {
    const rules = await getProjectRules('TEST-OVERVIEW');
    expect(rules).toBeDefined();
    expect(rules.content[0].text).toContain('Test Rules');
  });
});
```

## 7. Integration with Kubernetes

### Kubernetes Deployment Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      containers:
        - name: mcp-server
          image: mcp-server:latest
          command: ['npx', 'mcp-rules-server', '--rules-dir', '/rules']
          ports:
            - containerPort: 3000
          volumeMounts:
            - name: rules-volume
              mountPath: /rules
      volumes:
        - name: rules-volume
          configMap:
            name: project-rules
```

These integration examples demonstrate how to use the MCP Server in various environments and systems.
