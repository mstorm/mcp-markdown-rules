# Commit Message Rules

Based on [AngularJS Commit Convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format)

## Commit Message Structure

### Basic Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Required)

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Scope (Optional)

- `api`: API server related
- `web`: Web application related
- `db`: Database related
- `auth`: Authentication related
- `ui`: User interface related
- `core`: Core functionality
- `cli`: Command line interface
- `compiler`: Compiler related
- `compiler-cli`: Compiler CLI related
- `zone`: Zone.js related

### Subject (Required)

- Use imperative, present tense ("add" not "added" or "adds")
- Don't capitalize first letter
- No dot (.) at the end
- Maximum 50 characters

### Body (Optional)

- Use imperative, present tense ("change" not "changed" or "changes")
- Include motivation for the change and contrast with previous behavior
- Wrap at 72 characters

### Footer (Optional)

- Breaking Changes: should start with the word `BREAKING CHANGE:` with a space or two newlines
- Issue References: should start with the word `Closes` followed by a colon and the issue number

## Examples

### Feature Addition

```
feat(auth): add JWT token-based authentication system

- Implement JWT token generation and validation logic
- Add login/logout API endpoints
- Set token expiration time (24 hours)

Closes #123
```

### Bug Fix

```
fix(api): fix 500 error when retrieving user profile

- Add null check logic
- Improve error handling

Fixes #456
```

### Breaking Change

```
feat(api): change user authentication endpoint

BREAKING CHANGE: The user authentication endpoint has been moved from
`/auth/login` to `/api/v2/auth/login`. Update your client code
accordingly.

Closes #789
```

### Performance Improvement

```
perf(core): optimize database query performance

- Add database index for user lookup
- Implement query result caching
- Reduce N+1 query problems

Closes #101
```

### Documentation Update

```
docs: update API documentation

- Add authentication examples
- Include error response formats
- Update installation guide
```

## Rules

### Prohibited

- Using past tense (`fixed`, `added`, etc.)
- Ending with a period
- Too long titles (over 50 characters)
- Meaningless messages (`update`, `fix`, etc.)
- Capitalizing first letter of subject

### Recommended

- Use imperative present tense for all parts
- Clear and specific descriptions
- Include motivation for changes
- Reference related issue numbers
- Follow the exact format specified above

## Breaking Changes

When a commit introduces a breaking change, it should:

1. Start with `BREAKING CHANGE:` in the footer
2. Explain what changed and how to migrate
3. Be clearly marked to help with versioning

Example:

```
feat(api): change authentication method

BREAKING CHANGE: The authentication method has changed from session-based
to JWT token-based. Update your client code to include the Authorization
header with Bearer token.

Migration guide: https://docs.example.com/migration/auth
```
