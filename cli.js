#!/usr/bin/env node
'use strict';
var meow = require('meow');
var listNpmContents = require('./');

var cli = meow(`
	Usage
	$ list-npm-contents [package-name]

	Options
	-V, --module-version The version of the module you wish to view. Default: latest

	Examples:
	$ list-npm-contents lpad
	package.json
	index.js
	license
	readme.md

	$ list-npm-contents lpad -V 0.1.0
	package.json
	lpad.js
	readme.md
`,
	{
		string: 'V',
		alias: {
			V: 'module-version'
		}
	}
);

listNpmContents(cli.input[0], cli.flags.V).then(
	function(results) {
		console.log(results.join('\n'));
	}
).catch(
	function(err) {
		console.error('Sorry, but there was an error: %s', err.message);
		process.exit(1);
	}
)