# MCP Markdown Rules - Custom Rules Directory Example

This example demonstrates how to use external rules directories with the MCP Markdown Rules.

## Custom Rules Directory Structure

```
my-custom-rules/
├── development/
│   ├── README.md
│   ├── CODING-STANDARDS.md
│   └── TESTING-GUIDELINES.md
├── deployment/
│   ├── README.md
│   ├── CI-CD-PIPELINE.md
│   └── ENVIRONMENT-CONFIG.md
└── security/
    ├── README.md
    ├── AUTHENTICATION.md
    └── AUTHORIZATION.md
```

## Usage

### 1. Specify Custom Rules Directory

```bash
# Using npx (recommended)
npx mcp-markdown-rules --rules-dir /path/to/my-custom-rules

# Using absolute path
npx mcp-markdown-rules --rules-dir /path/to/my-custom-rules

# Using relative path
npx mcp-markdown-rules --rules-dir ./my-custom-rules

# Using environment variable
MCP_RULES_DIR=/path/to/my-custom-rules npx mcp-markdown-rules
```

### 2. Combine with Other Options

```bash
# Custom rules directory + file watching
npx mcp-markdown-rules --rules-dir ./my-custom-rules --watch

# Custom rules directory + keyboard interface
npx mcp-markdown-rules --rules-dir ./my-custom-rules --keyboard

# All features enabled
npx mcp-markdown-rules --rules-dir ./my-custom-rules --watch --keyboard
```

## Example Rule Files

### development/CODING-STANDARDS.md

```markdown
# Coding Standards

## Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_SNAKE_CASE for constants

## Code Formatting

- Use 2 spaces for indentation
- Maximum line length: 80 characters
- Always use semicolons
```

### deployment/CI-CD-PIPELINE.md

```markdown
# CI/CD Pipeline

## Build Process

1. Install dependencies
2. Run tests
3. Build application
4. Deploy to staging

## Deployment Checklist

- [ ] All tests pass
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance tests OK
```

## Generated Rule Keys

Using a custom rules directory will generate the following keys:

- `DEVELOPMENT-OVERVIEW`
- `DEVELOPMENT-CODING-STANDARDS`
- `DEVELOPMENT-TESTING-GUIDELINES`
- `DEPLOYMENT-OVERVIEW`
- `DEPLOYMENT-CI-CD-PIPELINE`
- `DEPLOYMENT-ENVIRONMENT-CONFIG`
- `SECURITY-OVERVIEW`
- `SECURITY-AUTHENTICATION`
- `SECURITY-AUTHORIZATION`

## Real-World Use Cases

1. **Team-specific rules**: Manage development rules for each team in separate directories
2. **Project-specific rules**: Reuse common rules across multiple projects
3. **External rules**: Apply company standards or industry best practices
4. **Dynamic rules**: Generate and apply rules dynamically in CI/CD pipelines

## Integration Examples

### With Docker

```bash
docker run -v /path/to/rules:/rules mcp-rules-server --rules-dir /rules
```

### With CI/CD

```bash
# In your CI pipeline
npx mcp-rules-server --rules-dir ./generated-rules --watch
```

### With Kubernetes

```yaml
volumes:
  - name: rules-volume
    configMap:
      name: project-rules
containers:
  - name: mcp-rules-server
    command: ['npx', 'mcp-rules-server', '--rules-dir', '/rules']
    volumeMounts:
      - name: rules-volume
        mountPath: /rules
```
