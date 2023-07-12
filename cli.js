#!/usr/bin/env node
const yargs = require('yargs')
.usage(`
Usage: $0 url
`)
.options({
  ignore: {
    alias: 'i',
    description: 'Ignore urls',
    type: 'string',
  },
  internal: {
    description: 'Check only internal urls',
    type: 'boolean',
  },
  depth: {
    alias: 'd',
    description: 'Depth',
    type: 'number',
    default: 4
  }
})
.describe({})
.boolean([])
.help()
.alias('h', 'help');

const argv = yargs.argv;

if (argv._.length) {
  run(argv._[0], {
    ignore: argv.ignore,
    internal: argv.internal,
    depth: argv.depth
  });
} else {
  throw new Error('URL is not define')
}

function run(value, options) {
  const module = require('./dist/common.js');

  module.checking(value, options).then((data) => {
    process.exit(data ? 0 : 1);
  })
}
