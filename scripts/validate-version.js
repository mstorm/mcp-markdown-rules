#!/usr/bin/env node

/**
 * Version validation script for Git pre-tag hook
 * Validates that the tag version matches or is higher than package.json version
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Get the tag version from git command
function getTagVersion() {
  try {
    // In pre-tag hook, the tag name is passed as argument
    const tagName = process.argv[2];
    if (!tagName) {
      console.error('❌ No tag name provided');
      process.exit(1);
    }

    // Remove 'v' prefix if present
    const cleanVersion = tagName.replace(/^v/, '');
    return { tagName, cleanVersion };
  } catch (error) {
    console.error('❌ Failed to get tag version:', error.message);
    process.exit(1);
  }
}

// Get current package.json version
function getPackageVersion() {
  try {
    const packagePath = join(process.cwd(), 'package.json');
    const packageContent = readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    return packageJson.version;
  } catch (error) {
    console.error('❌ Failed to read package.json:', error.message);
    process.exit(1);
  }
}

// Validate semantic version format
function validateVersionFormat(version) {
  const semverRegex =
    /^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  return semverRegex.test(version);
}

// Compare versions
function compareVersions(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;

    if (v1 < v2) return -1;
    if (v1 > v2) return 1;
  }

  return 0;
}

// Main validation logic
function main() {
  console.log('🔍 Validating tag version...');

  const { tagName, cleanVersion } = getTagVersion();
  const packageVersion = getPackageVersion();

  console.log(`📦 Package.json version: ${packageVersion}`);
  console.log(`🏷️  Tag version: ${tagName} (${cleanVersion})`);

  // Validate version format
  if (!validateVersionFormat(cleanVersion)) {
    console.error('❌ Invalid version format:', cleanVersion);
    console.error(
      'Version must follow semantic versioning (e.g., 1.0.0, 2.1.0-beta.1)'
    );
    process.exit(1);
  }

  // Compare versions
  const comparison = compareVersions(cleanVersion, packageVersion);

  if (comparison < 0) {
    console.error('❌ Version downgrade detected!');
    console.error(
      `Tag version ${cleanVersion} is lower than package.json version ${packageVersion}`
    );
    console.error(
      'This would cause a version downgrade, which is not allowed.'
    );
    console.error('');
    console.error('💡 Solutions:');
    console.error('1. Use a higher version number for the tag');
    console.error('2. Update package.json version first, then create the tag');
    console.error('3. Delete the tag and recreate with correct version');
    process.exit(1);
  }

  if (comparison === 0) {
    console.log('✅ Version match: Tag version equals package.json version');
  } else {
    console.log(
      '✅ Version upgrade: Tag version is higher than package.json version'
    );
  }

  console.log('🎉 Version validation passed! Tag creation allowed.');
}

// Run validation
main();
