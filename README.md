# json-reporter

[![npm](https://img.shields.io/npm/v/json-reporter.svg)](https://www.npmjs.com/package/json-reporter)
[![Build Status](https://travis-ci.org/gemini-testing/json-reporter.svg?branch=master)](https://travis-ci.org/gemini-testing/json-reporter)
[![Coverage Status](https://img.shields.io/coveralls/gemini-testing/json-reporter.svg?style=flat)](https://coveralls.io/r/gemini-testing/json-reporter?branch=master)

Common plugin for:

* [gemini](https://github.com/gemini-testing/gemini)
* [hermione](https://github.com/gemini-testing/hermione)

which is intended to aggregate the results of tests running.

You can read more about gemini plugins [here](https://github.com/gemini-testing/gemini/blob/master/doc/plugins.md)
and hermione plugins [here](https://github.com/gemini-testing/hermione#plugins).

## Installation

```bash
npm install json-reporter
```

## Usage

Plugin has following configuration:

* **enabled** (optional) `Boolean` – enable/disable the plugin; by default plugin is enabled
* **path** (optional) `String` - path for saving json report file; by default json report will be saved into `json-reporter.json` inside current work directory.

Also there is ability to override plugin parameters by CLI options or environment variables
(see [configparser](https://github.com/gemini-testing/configparser)).

### Gemini usage

Add plugin to your `gemini` config file:

```js
module.exports = {
    // ...
    plugins: {
        'json-reporter/gemini': {
            enabled: true,
            path: 'my/custom/report.json'
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
            path: 'my/custom/report.json'
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
