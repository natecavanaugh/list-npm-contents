# list-npm-contents
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> List the contents of an npm package


## Install

```
$ npm install --save list-npm-contents
```


## Usage

```js
var listNpmContents = require('list-npm-contents');

listNpmContents('belgian');
//=> BEST BEER EVAR!
```

## CLI

```
$ npm install --global list-npm-contents
```
```
$ list-npm-contents --help

  Usage
    list-npm-contents [input]

  Example
    list-npm-contents
    BEER!

    list-npm-contents belgian
    BEST BEER EVAR!

  Options
    --foo Lorem ipsum. Default: false
```


## API

### listNpmContents(input, [options])

#### input

*Required*
Type: `string`

Lorem ipsum.

#### options

##### foo

Type: `boolean`
Default: `false`

Lorem ipsum.


## License

MIT © [Nate Cavanaugh](http://alterform.com)

[npm-image]: https://img.shields.io/npm/v/list-npm-contents.svg?style=flat-square
[npm-url]: https://npmjs.org/package/list-npm-contents
[travis-image]: https://img.shields.io/travis/natecavanaugh/list-npm-contents/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/natecavanaugh/list-npm-contents
[coveralls-image]: https://img.shields.io/coveralls/natecavanaugh/list-npm-contents/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/natecavanaugh/list-npm-contents?branch=master