# How to contribute

## Requirements

- node 14.4 - Tested on 14.4 and 14.19. Unluckily there are [dev server issues with more recent versions](https://stackoverflow.com/questions/69692842/error-message-error0308010cdigital-envelope-routinesunsupported).
- make (recommended)

## Installation

```bash
make install
```

This will install both the package and the example application.

## Running

```bash
make start
```

This will run a local development server with live-reload capabilities.

## E2E tests

```bash
e2e_open
```

Open the Cypress user interfare for running E2E tests interactively.
