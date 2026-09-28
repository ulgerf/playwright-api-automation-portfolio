# Playwright API Automation Portfolio

[![API tests](https://github.com/ulgerf/playwright-api-automation-portfolio/actions/workflows/api-tests.yml/badge.svg)](https://github.com/ulgerf/playwright-api-automation-portfolio/actions/workflows/api-tests.yml)

A maintainable API test automation project built with **Playwright**, **TypeScript**, and **Cucumber BDD**. The suite validates a Users REST API, covering positive flows, validation, authorization, pagination, and a complete CRUD lifecycle.

The project starts its own lightweight API server during the test run. This makes the suite deterministic and allows it to run locally or in CI without external services, accounts, tokens, or test data dependencies.

## What this project demonstrates

- REST API testing with Playwright `APIRequestContext`
- BDD scenarios and reusable Cucumber step definitions
- Positive, negative, and end-to-end test coverage
- Isolated test data and automatic environment setup
- Strong TypeScript configuration and type checking
- HTML, JSON, and JUnit test reports
- Automated execution with GitHub Actions
- CI artifacts retained for failed and successful runs

## Test coverage

| Area | Scenarios |
| --- | --- |
| Retrieval | List users, pagination, existing user, missing user |
| Creation | Valid user, missing fields, invalid email, unauthorized request |
| Update | Full update and partial update |
| Deletion | Successful deletion and unauthorized deletion |
| End-to-end | Create, verify, delete, and confirm removal |

## Technology stack

- Node.js 22
- Playwright
- TypeScript
- Cucumber
- GitHub Actions

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or newer
- npm

### Installation

```bash
git clone https://github.com/ulgerf/playwright-api-automation-portfolio.git
cd playwright-api-automation-portfolio
npm ci
```

### Run all tests

```bash
npm test
```

### Run smoke tests

```bash
npm run test:smoke
```

### Validate TypeScript

```bash
npm run typecheck
```

## Test reports

Every test run creates the following files in `test-results/`:

- `cucumber-report.html` — readable HTML report
- `cucumber-report.json` — machine-readable result data
- `cucumber-junit.xml` — CI-compatible JUnit report

Open `test-results/cucumber-report.html` in a browser to review the result.

## Project structure

```text
.
├── .github/workflows/       # Continuous integration workflow
├── src/test/features/       # Gherkin feature files
├── src/test/steps/          # Cucumber step definitions
├── support/
│   ├── hooks.ts             # Test lifecycle hooks
│   ├── mockApiServer.ts     # Deterministic local REST API
│   ├── types.ts             # Shared domain types
│   └── world.ts             # Scenario-specific test context
├── cucumber.js              # Cucumber profiles and reporters
├── package.json             # Commands and dependencies
└── tsconfig.json            # TypeScript configuration
```

## Design choices

Each scenario receives a new Playwright API context, while the test data is reset before every scenario. Responses and created resource identifiers are stored in the scenario world instead of global variables. Failed network requests and failed assertions stop the test immediately, ensuring that the CI result reflects the actual product quality.

## Continuous integration

GitHub Actions runs the following checks for every push and pull request:

1. Install dependencies with `npm ci`
2. Validate the TypeScript source
3. Execute all API scenarios
4. Upload the generated reports as a workflow artifact

## License

This project is available under the [MIT License](LICENSE).
