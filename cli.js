#!/usr/bin/env node
'use strict';
var meow = require('meow');
var listNpmContents = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ list-npm-contents [input]',
		'',
		'Options',
		'  --foo Lorem ipsum. Default: false',
		'Examples',
		'  $ list-npm-contents',
		'  BEER!',
		'',
		'  $ list-npm-contents belgian',
		'  BEST BEER EVAR!',
		''
	]
});

console.log(listNpmContents(cli.input[0] || 'BEER!'));