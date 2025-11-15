# Contributing to ColorDetective

First off, thank you for considering contributing to ColorDetective! It's people like you that make ColorDetective such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [npm@jhonipereira.com](mailto:npm@jhonipereira.com).

## Getting Started

- Make sure you have a [GitHub account](https://github.com/signup/free)
- Fork the repository on GitHub
- Check out the [README](README.md) for project information

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [issue tracker](https://github.com/jhonipereira/colordetective/issues) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots or animated GIFs** if possible
- **Include browser version and OS details**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior** and **explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through `good-first-issue` and `help-wanted` issues:

- **Good first issues** - issues which should only require a few lines of code
- **Help wanted issues** - issues which should be a bit more involved than beginner issues

### Pull Requests

- Fill in the required template
- Follow the [style guidelines](#style-guidelines)
- Include screenshots and animated GIFs in your pull request whenever possible
- End all files with a newline
- Avoid platform-dependent code

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/colordetective.git
   cd colordetective
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Make your changes**
   - Write or adapt tests as needed
   - Follow the existing code style
   - Keep your changes focused - one feature/fix per pull request

5. **Test your changes**
   ```bash
   npm test
   ```

## Pull Request Process

1. **Update documentation** - Update the README.md with details of changes if applicable
2. **Follow the coding style** - Ensure your code follows the project's style guidelines
3. **Write meaningful commit messages** - Follow our [commit message guidelines](#commit-message-guidelines)
4. **Test thoroughly** - Make sure all tests pass and add new tests for new features
5. **Keep it focused** - One pull request per feature/fix
6. **Update the CHANGELOG** - If applicable, add your changes to the CHANGELOG.md
7. **Request review** - Wait for maintainers to review your PR
8. **Address feedback** - Make changes if requested by reviewers
9. **Squash commits** - If requested, squash your commits before merging

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-color-picker`)
- `fix/` - Bug fixes (e.g., `fix/resolve-detection-issue`)
- `docs/` - Documentation only changes (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/improve-performance`)
- `test/` - Adding or updating tests (e.g., `test/add-unit-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

## Style Guidelines

### Code Style

- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused on a single task
- Use ES6+ features appropriately
- Follow the EditorConfig settings defined in [.editorconfig](.editorconfig)

### JavaScript/TypeScript Style

- Use 2 spaces for indentation (as defined in .editorconfig)
- Use semicolons
- Use single quotes for strings
- Use template literals for string interpolation
- Use arrow functions where appropriate
- Use `const` and `let` instead of `var`

### File Organization

- Keep files focused on a single responsibility
- Use clear, descriptive file names
- Group related files together

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect the code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Changes to the build process or auxiliary tools

### Examples

```
feat(detection): add support for HSL color detection

Add HSL color space detection alongside existing RGB detection.
Improves color profile analysis for CSS-defined elements.

Closes #123
```

```
fix(popup): resolve color picker rendering issue

The color picker was not displaying correctly on Firefox.
Updated rendering logic to be cross-browser compatible.

Fixes #456
```

## Issue Guidelines

### Creating Issues

- **Search first** - Check if the issue already exists
- **Be specific** - Provide clear, detailed information
- **One issue per report** - Don't combine multiple issues
- **Use labels** - Apply appropriate labels when possible

### Issue Templates

When creating an issue, please use one of the following formats:

**Bug Report:**
- Description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS information
- Screenshots (if applicable)

**Feature Request:**
- Description
- Use case
- Proposed solution
- Alternatives considered

## Questions?

Feel free to open an issue with the `question` label or reach out to [npm@jhonipereira.com](mailto:npm@jhonipereira.com).

## License

By contributing to ColorDetective, you agree that your contributions will be licensed under its MIT License.

---

Thank you for contributing! 🎨🔍