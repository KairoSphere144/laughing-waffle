# KairoSphere

Industrial intelligence and trade operations workspace. The initial operating market is Suriname, with an architecture intended to support international trade workflows over time.

## Current build: foundation preview

This first vertical slice provides:
- A responsive operations dashboard.
- An opportunity pipeline with stage and currency labels.
- Input validation and separate USD/SRD totals (currencies are never combined).
- A zero-dependency domain layer and Node.js automated tests.
- GitHub Actions CI for pushes and pull requests.

The included records are illustrative. New records are held in application memory for the current browser session only; refreshing the page clears them. This preview has no authentication, backend, database, or external integrations. Do not enter confidential, personal, client, supplier, or payment information.

## Requirements

- Node.js 20 or later for the test suite.
- A modern browser to view the application.

## Run locally

Serve the repository root with any static HTTP server, then open the local address in a browser. For example:

```sh
npx serve .
```

Run automated tests:

```sh
npm test
```

No application dependencies are required.

## Structure

```text
.
├── index.html
├── src/
│   ├── app.js
│   ├── domain.js
│   └── styles.css
├── tests/
│   └── domain.test.js
└── .github/
    └── workflows/
        └── ci.yml
```

## Planned milestones

1. Foundation and architecture validation.
2. Secure application backend, authentication, database, and operations dashboard.
3. Industrial goods catalog and CRM.
4. Market intelligence, source attribution, and commercial calculations.
5. Quotations, invoices, and payment/settlement recordkeeping.
6. Security hardening, integration testing, deployment preparation, and documentation.

Financial functions are recordkeeping and analysis only; the application must not execute financial transactions. Live data must be source-attributed and distinguish verified, estimated, sample, and user-entered values.
