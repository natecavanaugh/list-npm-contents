# list-npm-contents
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> List the file contents of an npm package

This will list the files that are actually in the tarball of the NPM module, not just what's reported in the files field of package.json.


## Install

```
$ npm install --save list-npm-contents
```


## Usage

```js
var listNpmContents = require('list-npm-contents');

listNpmContents('lpad').then(
	files => console.log(files)
);
//=> [ 'package.json', 'index.js', 'license', 'readme.md' ]

listNpmContents('lpad', '0.1.0').then(
	files => console.log(files)
);
//=> [ 'package.json', 'lpad.js', 'readme.md' ]
```

## CLI

```
$ npm install --global list-npm-contents
```
```
$ list-npm-contents --help

  Usage
$ list-npm-contents package-name

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
```


## API

### listNpmContents(packageName, [version])

#### packageName

*Required*
Type: `string`

The name of the package on NPM to look up the files for.

#### version

Type: `string`
Default: `latest`

The version of the module to look for.

## License

MIT © [Nate Cavanaugh](http://alterform.com)

[npm-image]: https://img.shields.io/npm/v/list-npm-contents.svg?style=flat-square
[npm-url]: https://npmjs.org/package/list-npm-contents
[travis-image]: https://img.shields.io/travis/natecavanaugh/list-npm-contents/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/natecavanaugh/list-npm-contents
[coveralls-image]: https://img.shields.io/coveralls/natecavanaugh/list-npm-contents/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/natecavanaugh/list-npm-contents?branch=master