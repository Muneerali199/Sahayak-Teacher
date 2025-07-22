# Contributing to Sahayak Teacher

First off, thank you for considering contributing to Sahayak Teacher! It's people like you that make open source such a great community. We welcome any type of contribution, not only code.

## Table of Contents

- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Styleguides](#styleguides)
  - [Git Commit Messages](#git-commit-messages)
  - [Code Style](#code-style)
- [Code of Conduct](#code-of-conduct)

## Getting Started

To get started with development, please follow the setup instructions in our main [README.md](./README.md) file. This will guide you through cloning the repository, installing dependencies, and running the development servers.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please make sure to include the following information in your issue:
- A clear and descriptive title.
- A detailed description of the bug and the steps to reproduce it.
- Screenshots or screen recordings, if applicable.
- Information about your environment (e.g., browser, OS).

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, we'd love to hear about it! Please create an issue with:
- A clear title describing the enhancement.
- A detailed explanation of the proposed feature and why it would be valuable.
- Any mockups or examples that might help illustrate your idea.

### Pull Requests

We actively welcome your pull requests.

- Fixed "Invalid next.config.ts options detected" error by removing the `serverActions` option from the `next.config.ts` file.
- Fixed "Cross origin request detected" warning by adding the `allowedDevOrigins` option to the `next.config.ts` file.

1.  Fork the repo and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes.
4.  Make sure your code lints.
5.  Issue that pull request!

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.

### Code Style

This project uses Prettier and ESLint to maintain code style and quality. Please ensure your code conforms to the project's linting rules before submitting a pull request. You can run `npm run lint` to check your code.

## Code of Conduct

To ensure a welcoming and inclusive community, we expect all contributors to adhere to a code of conduct. Please be respectful and considerate in all your interactions. Harrassment or any form of exclusionary behavior will not be tolerated.
