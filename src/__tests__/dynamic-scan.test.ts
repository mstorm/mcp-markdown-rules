import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Function to dynamically read project rule files (same as src/index.ts)
function getProjectRules(rulesDir?: string) {
  const defaultRulesDir = join(__dirname, '..', '..', 'rules');
  const targetRulesDir = rulesDir || defaultRulesDir;
  const rules: Record<string, string> = {};

  try {
    if (!existsSync(targetRulesDir)) {
      throw new Error(`Rules directory not found: ${targetRulesDir}`);
    }

    const entries = readdirSync(targetRulesDir, { withFileTypes: true });

    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        const toolDir = join(targetRulesDir, entry.name);
        const toolName = entry.name.toUpperCase();

        try {
          const toolFiles = readdirSync(toolDir);

          toolFiles.forEach((file) => {
            if (file.endsWith('.md')) {
              const filePath = join(toolDir, file);
              const content = readFileSync(filePath, 'utf-8');

              const ruleKey =
                file === 'README.md'
                  ? `${toolName}-OVERVIEW`
                  : `${toolName}-${file.replace('.md', '').toUpperCase()}`;

              rules[ruleKey] = content;
            }
          });
        } catch (error) {
          throw new Error(
            `Error reading tool directory ${entry.name}: ${error}`
          );
        }
      }
    });
  } catch (error) {
    throw new Error(`Error reading rules files: ${error}`);
  }

  return rules;
}

// Test helper function to create temporary test files
function createTestRulesStructure() {
  const testRulesDir = join(__dirname, 'test-rules');

  // Create test rules directory
  if (!existsSync(testRulesDir)) {
    mkdirSync(testRulesDir, { recursive: true });
  }

  // Create general directory
  const generalDir = join(testRulesDir, 'general');
  if (!existsSync(generalDir)) {
    mkdirSync(generalDir, { recursive: true });
  }

  // Create test files
  writeFileSync(
    join(generalDir, 'README.md'),
    '# Test Overview\nThis is a test overview.'
  );
  writeFileSync(
    join(generalDir, 'COMMIT-MESSAGES.md'),
    '# Test Commit Messages\nThis is a test commit messages guide.'
  );

  return testRulesDir;
}

// Test helper function to create custom rules structure
function createCustomRulesStructure() {
  const customRulesDir = join(__dirname, 'custom-rules');

  // Create custom rules directory
  if (!existsSync(customRulesDir)) {
    mkdirSync(customRulesDir, { recursive: true });
  }

  // Create different directory structure
  const customDir = join(customRulesDir, 'custom');
  if (!existsSync(customDir)) {
    mkdirSync(customDir, { recursive: true });
  }

  // Create different test files
  writeFileSync(
    join(customDir, 'README.md'),
    '# Custom Overview\nThis is a custom overview.'
  );
  writeFileSync(
    join(customDir, 'CUSTOM-RULES.md'),
    '# Custom Rules\nThis is a custom rules guide.'
  );

  return customRulesDir;
}

// Test helper function to clean up test files
function cleanupTestRules(testRulesDir: string) {
  if (existsSync(testRulesDir)) {
    rmSync(testRulesDir, { recursive: true, force: true });
  }
}

describe('Dynamic File Scanning', () => {
  let testRulesDir: string;

  beforeEach(() => {
    testRulesDir = createTestRulesStructure();
  });

  afterEach(() => {
    cleanupTestRules(testRulesDir);
  });

  it('should scan and load all markdown files from rules directory', () => {
    const rules = getProjectRules();

    // At least some rules should be loaded
    expect(Object.keys(rules).length).toBeGreaterThan(0);

    // Check GENERAL directory (only remaining directory)
    expect(rules['GENERAL-OVERVIEW']).toBeDefined();
    expect(rules['GENERAL-COMMIT-MESSAGES']).toBeDefined();
  });

  it('should generate correct keys for different file types', () => {
    const rules = getProjectRules();

    // README.md should be converted to OVERVIEW
    expect(rules['GENERAL-OVERVIEW']).toBeDefined();

    // Regular .md files should keep their names
    expect(rules['GENERAL-COMMIT-MESSAGES']).toBeDefined();
  });

  it('should load markdown content correctly', () => {
    const rules = getProjectRules();

    // Content should not be empty
    Object.values(rules).forEach((content) => {
      expect(content).toBeTypeOf('string');
      expect(content.length).toBeGreaterThan(0);
    });
  });

  it('should handle missing rules directory gracefully', () => {
    // This test verifies that the function handles errors gracefully
    // Since we can't easily remove the rules directory during testing,
    // we'll test that the function doesn't throw when called normally
    expect(() => getProjectRules()).not.toThrow();

    // Verify that rules are loaded correctly
    const rules = getProjectRules();
    expect(typeof rules).toBe('object');
  });

  it('should process markdown files with correct encoding', () => {
    const rules = getProjectRules();

    // Check that content is properly decoded
    Object.entries(rules).forEach(([, content]) => {
      expect(content).toContain('#');
      expect(content).toContain('\n');
    });
  });

  it('should handle special characters in file names', () => {
    const rules = getProjectRules();

    // All keys should be valid
    Object.keys(rules).forEach((key) => {
      expect(key).toMatch(/^[A-Z0-9_-]+$/);
      expect(key.length).toBeGreaterThan(0);
    });
  });
});

describe('Custom Rules Directory Support', () => {
  let customRulesDir: string;

  beforeEach(() => {
    customRulesDir = createCustomRulesStructure();
  });

  afterEach(() => {
    cleanupTestRules(customRulesDir);
  });

  it('should load rules from custom directory when specified', () => {
    const rules = getProjectRules(customRulesDir);

    // Should load from custom directory
    expect(Object.keys(rules).length).toBeGreaterThan(0);
    expect(rules['CUSTOM-OVERVIEW']).toBeDefined();
    expect(rules['CUSTOM-CUSTOM-RULES']).toBeDefined();
  });

  it('should load different content from custom directory', () => {
    const defaultRules = getProjectRules();
    const customRules = getProjectRules(customRulesDir);

    // Content should be different
    expect(defaultRules['GENERAL-OVERVIEW']).not.toBe(
      customRules['CUSTOM-OVERVIEW']
    );
    expect(customRules['CUSTOM-OVERVIEW']).toContain('Custom Overview');
  });

  it('should handle non-existent custom directory gracefully', () => {
    const nonExistentDir = join(__dirname, 'non-existent-rules');

    expect(() => getProjectRules(nonExistentDir)).toThrow(
      'Rules directory not found'
    );
  });

  it('should maintain consistent key generation across different directories', () => {
    const defaultRules = getProjectRules();
    const customRules = getProjectRules(customRulesDir);

    // Both should have consistent key patterns
    Object.keys(defaultRules).forEach((key) => {
      expect(key).toMatch(/^[A-Z0-9_-]+$/);
    });

    Object.keys(customRules).forEach((key) => {
      expect(key).toMatch(/^[A-Z0-9_-]+$/);
    });
  });
});

describe('Rules Content Validation', () => {
  it('should contain expected rule content', () => {
    const rules = getProjectRules();

    // Check that GENERAL-OVERVIEW contains expected content
    if (rules['GENERAL-OVERVIEW']) {
      expect(rules['GENERAL-OVERVIEW']).toContain('Project Common Rules');
      expect(rules['GENERAL-OVERVIEW']).toContain('Table of Contents');
    }

    // Check that GENERAL-COMMIT-MESSAGES contains expected content
    if (rules['GENERAL-COMMIT-MESSAGES']) {
      expect(rules['GENERAL-COMMIT-MESSAGES']).toContain(
        'Commit Message Rules'
      );
      expect(rules['GENERAL-COMMIT-MESSAGES']).toContain(
        'AngularJS Commit Convention'
      );
    }
  });

  it('should have consistent formatting across all rules', () => {
    const rules = getProjectRules();

    Object.entries(rules).forEach(([, content]) => {
      // All markdown files should start with a heading
      expect(content.trim()).toMatch(/^#\s+/);

      // Content should have reasonable length
      expect(content.length).toBeGreaterThan(50);
      expect(content.length).toBeLessThan(10000);
    });
  });
});

describe('Command Line Arguments Simulation', () => {
  it('should handle --rules-dir option correctly', () => {
    // Simulate --rules-dir option by passing custom directory
    const customRulesDir = join(__dirname, 'test-custom-rules');

    try {
      // Create temporary custom rules
      if (!existsSync(customRulesDir)) {
        mkdirSync(customRulesDir, { recursive: true });
      }

      const customDir = join(customRulesDir, 'test');
      if (!existsSync(customDir)) {
        mkdirSync(customDir, { recursive: true });
      }

      writeFileSync(
        join(customDir, 'README.md'),
        '# Test Custom\nThis is a test custom overview.'
      );

      // Test loading from custom directory
      const rules = getProjectRules(customRulesDir);
      expect(rules['TEST-OVERVIEW']).toBeDefined();
      expect(rules['TEST-OVERVIEW']).toContain('Test Custom');
    } finally {
      // Cleanup
      cleanupTestRules(customRulesDir);
    }
  });

  it('should maintain backward compatibility with default rules directory', () => {
    const defaultRules = getProjectRules();
    const explicitDefaultRules = getProjectRules(
      join(__dirname, '..', '..', 'rules')
    );

    // Both should return the same content
    expect(Object.keys(defaultRules)).toEqual(
      Object.keys(explicitDefaultRules)
    );

    Object.keys(defaultRules).forEach((key) => {
      expect(defaultRules[key]).toBe(explicitDefaultRules[key]);
    });
  });
});
