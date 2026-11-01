# KairoSphere

Industrial intelligence and trade operations workspace. The initial operating market is Suriname, with an architecture intended to support international trade workflows over time.

## Current build: foundation preview

This first vertical slice provides:
- A responsive operations dashboard.
- An opportunity pipeline with stage and currency labels.
- Input validation and separate USD/SRD totals (currencies are never combined).
- A zero-dependency domain layer and Node.js automated tests.
- GitHub Actions CI for pushes and pull requests.
- Shared Visual Studio Code workspace configuration.

The included records are illustrative. New records are held in application memory for the current browser session only; refreshing the page clears them. This preview has no authentication, backend, database, or external integrations. Do not enter confidential, personal, client, supplier, or payment information.

## Requirements

- Node.js 20 or later for the test suite.
- Visual Studio Code (recommended) or another editor.
- A modern browser to view the application.

## Connect GitHub to Visual Studio Code

1. Install Visual Studio Code and the Git command-line tools.
2. Open VS Code and install/sign in to the **GitHub Pull Requests** extension if you want to manage pull requests from the editor. GitHub authentication is handled through VS Code's Accounts menu.
3. Open the Command Palette and choose **Git: Clone**.
4. Paste the repository URL: `https://github.com/KairoSphere144/laughing-waffle.git`.
5. Choose a local folder, then open the cloned `laughing-waffle` workspace.
6. Switch to the `main` branch for the current integrated foundation.

The repository includes `.vscode/` workspace settings, a recommended Live Server extension, a test task, and a browser-debug launch configuration. VS Code will prompt to install the recommended extension.

## Run locally

- In VS Code, open `index.html`.
- Start **Live Server** using the status-bar action or the editor context menu.
- The launch configuration expects the preview at `http://127.0.0.1:5500`.
- Run **Terminal → Run Task → KairoSphere: run tests**, or execute `npm test` in the integrated terminal.

No application dependencies are required. Node.js 20+ is needed for tests.

## Structure

```text
.
├── .github/workflows/ci.yml
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   ├── settings.json
│   └── tasks.json
├── index.html
├── src/
│   ├── app.js
│   ├── domain.js
│   └── styles.css
├── tests/
│   └── domain.test.js
└── package.json
```

## Planned milestones

1. Foundation and architecture validation.
2. Secure application backend, authentication, database, and operations dashboard.
3. Industrial goods catalog and CRM.
4. Market intelligence, source attribution, and commercial calculations.
5. Quotations, invoices, and payment/settlement recordkeeping.
6. Security hardening, integration testing, deployment preparation, and documentation.

Financial functions are recordkeeping and analysis only; the application must not execute financial transactions. Live data must be source-attributed and distinguish verified, estimated, sample, and user-entered values.
