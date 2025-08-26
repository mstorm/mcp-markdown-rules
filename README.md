# MCP Markdown Rules

A Model Context Protocol (MCP) server for managing and serving project rules and guidelines from Markdown files.

## Features

- 📚 **Dynamic Rule Loading**: Automatically scan and load markdown files from rules directories
- 🔄 **File Watching**: Real-time monitoring of rule changes with automatic cache invalidation
- ⌨️ **Keyboard Interface**: Interactive controls for development (quit, restart)
- 🎯 **Custom Rules Directory**: Support for external rules directories
- 🚀 **MCP Protocol**: Full Model Context Protocol compliance
- 📦 **Easy Distribution**: Simple npm package distribution

## Quick Start

### Using npx (Recommended)

```bash
# Basic server
npx mcp-markdown-rules

# With file watching
npx mcp-markdown-rules --watch

# With keyboard interface
npx mcp-markdown-rules --keyboard

# With custom rules directory
npx mcp-markdown-rules --rules-dir ./my-rules

# Show help
npx mcp-markdown-rules --help
```

### Installation

```bash
npm install mcp-markdown-rules
```

## Command Line Options

- `--watch` / `-w`: Enable file watching for rule changes
- `--keyboard` / `-k`: Enable keyboard interface (q=quit, r=restart)
- `--rules-dir <path>` / `-r <path>`: Specify custom rules directory path
- `--help` / `-h`: Show help message

## Examples

Check out the comprehensive examples in the `docs/` directory:

- **[Basic Usage](./docs/basic.md)**: Get started with the MCP Markdown Rules
- **[Custom Rules](./docs/custom-rules.md)**: Use external rules directories
- **[Integration](./docs/integration.md)**: Integrate with other systems

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Development mode
pnpm dev

# Test
pnpm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Release Process

To release a new version:

1. Update version: `pnpm version [patch|minor|major]`
2. This will automatically:
   - Update package.json version
   - Create a git tag
   - Push changes and tags
3. GitHub Actions will automatically:
   - Run tests
   - Build the project
   - Publish to npm

## License

MIT
