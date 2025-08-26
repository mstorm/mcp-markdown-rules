import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MCPServer',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@modelcontextprotocol/sdk',
        'fs',
        'path',
        'node:fs',
        'node:path',
        'node:process',
        'process',
        'readline',
      ],
      output: {
        globals: {
          '@modelcontextprotocol/sdk': 'MCPSDK',
          fs: 'fs',
          path: 'path',
          process: 'process',
          readline: 'readline',
        },
      },
    },
    target: 'ES2022',
    minify: false,
    sourcemap: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      logLevel: 'silent',
      tsconfigPath: './tsconfig.json',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
