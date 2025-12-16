# json-reporter

[![npm](https://img.shields.io/npm/v/json-reporter.svg)](https://www.npmjs.com/package/json-reporter)
[![Build Status](https://travis-ci.org/gemini-testing/json-reporter.svg?branch=master)](https://travis-ci.org/gemini-testing/json-reporter)

Common plugin for:

* [testplane](https://github.com/gemini-testing/testplane)
* [hermione](https://github.com/gemini-testing/testplane/tree/hermione)

which is intended to aggregate the results of tests running.

You can read more about testplane plugins [here](https://github.com/gemini-testing/testplane/blob/master/docs/config.md#plugins).

## Installation

```bash
npm install json-reporter
```

## Usage

Plugin has following configuration:

* **enabled** (optional) `Boolean` – enable/disable the plugin; by default plugin is enabled
* **path** (optional) `String` - path for saving json report file; by default json report will be saved into `json-reporter.json` inside current work directory.
* **includeHistory** (optional) `Boolean` – include test execution history in the json report; by default history is not included. Note: history is not available for skipped tests and may be undefined.

Also there is ability to override plugin parameters by CLI options or environment variables
(see [configparser](https://github.com/gemini-testing/configparser)).

### Testplane usage

Add plugin to your `testplane` config file:

```ts
export default {
    // ...
    plugins: {
        'json-reporter/testplane': {
            enabled: true,
            path: 'my/custom/report.json',
            includeHistory: true
        }
    },
    //...
}
```

### Hermione usage

Add plugin to your `hermione` config file:

```js
module.exports = {
    // ...
    plugins: {
        'json-reporter/hermione': {
            enabled: true,
            path: 'my/custom/report.json',
            includeHistory: true
        }
    },
    //...
}
```

## Testing

Run [mocha](http://mochajs.org) tests:
```bash
npm run test-unit
```

Run tests with [istanbul](https://github.com/gotwarlost/istanbul) coverage calculation:
```bash
npm run cover
```

Run [eslint](http://eslint.org) codestyle verification
```bash
npm run lint
```
