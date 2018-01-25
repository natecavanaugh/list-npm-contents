'use strict';
const isUrl = require('is-url');
const listNpmContents = require('../');

const chai = require('chai');
const fs = require('fs');
const got = require('got');
const path = require('path');
const sinon = require('sinon');
const tmp = require('tmp');

const Promise = require('bluebird');

chai.use(require('chai-string'));

const assert = chai.assert;

const lodashPackageMeta = require('./fixture/lodash/package_meta');
const cliPackageMeta = require('./fixture/cli/package_meta');

const lodashDist = lodashPackageMeta.versions['4.17.4'].dist;

lodashDist.tarball = lodashDist.tarball.replace('lodash-4.17.4.tgz', 'lodash.tar.gz');

const cliDist = cliPackageMeta.versions['0.4.2'].dist;

cliDist.tarball = cliDist.tarball.replace('cli-0.4.2.tgz', 'cli.tar.gz');

const lodashPath = path.join(__dirname, './fixture/lodash.tar.gz');
const cliPath = path.join(__dirname, './fixture/cli.tar.gz');

const packageArchive = fs.readFileSync(lodashPath);

const lodashBody = JSON.stringify(lodashPackageMeta);
const cliBody = JSON.stringify(cliPackageMeta);

describe(
	'list NPM contents',
	function() {
		var sandbox;

		beforeEach(
			function() {
				sandbox = sinon.sandbox.create();

				sandbox.stub(got, 'get');

				got.get.callsFake(
					function(url, options) {
						var value = {};

						if (url.endsWith('lodash')) {
							value.body = lodashBody;
						}
						else if (url.endsWith('cli')) {
							value.body = cliBody;
						}

						return Promise.resolve(value);
					}
				);

				sandbox.stub(fs, 'writeFile').callsArg(2);
				sandbox.stub(tmp, 'dir').callsArgWith(1, null, path.dirname(lodashPath));
			}
		);

		afterEach(
			function() {
				sandbox.restore();
			}
		);

		it(
			'should return a list of files',
			function(done) {
				listNpmContents('lodash').then(
					function(results) {
						assert.isArray(results);

						assert.equal(results.length, 1);
						assert.equal(results[0], 'test.js');

						done();
					}
				)
				.catch(done);
			}
		);

		it(
			'should handle scoped packages',
			function(done) {
				listNpmContents('@busy-web/cli')
				.then(
					function(results) {
						assert.isArray(results);

						assert.equal(results.length, 1);
						assert.equal(results[0], 'README.md');

						done();
					}
				);
			}
		);

		it(
			'should fail with no arguments',
			function(done) {
				listNpmContents()
				.catch(
					function(err) {
						assert.equal(err.message, 'You must specify a published package name');

						done();
					}
				);
			}
		);

		it(
			'should normalize version numbers',
			function() {
				var versions = {
					'1.0.0': '1.0.0',
					'2.0': '2.0.0',
					'3': '3.0.0',
					'4.x': '4.0.0',
					'4.1.x': '4.1.0',
					'4.x.1': '4.0.1',
					'latest': '4.17.4',
					'1.0.0-rc.2': '1.0.0-rc.2',
					'0.5.0-rc.1': '0.5.0-rc.1'
				};

				Object.keys(versions).forEach(
					function(item, index) {
						assert.equal(listNpmContents.normalizeVersion(item, lodashPackageMeta), versions[item]);
					}
				);

				var invalidVersions = [
					// Invalid because it doesn't exist in the package metadata
					'next',
					'x.4.0',
				];

				invalidVersions.forEach(
					function(item, index) {
						var err = null;

						try {
							listNpmContents.normalizeVersion(item, lodashPackageMeta);
						}
						catch (e) {
							err = e;
						}

						assert.isNotNull(err);
						assert.equal(err.message, `Invalid version: ${item}`);
					}
				);
			}
		);

		it(
			'should fetch a valid npm tarball url',
			function(done) {
				listNpmContents.fetch('lodash').then(
					function(url) {
						assert.isTrue(isUrl(url));
						done();
					}
				)
				.catch(done);
			}
		);

		it(
			'should create a valid tmp directory',
			function(done) {
				listNpmContents.createTmp(lodashDist.tarball).then(
					function(obj) {
						assert.isObject(obj);
						assert.equal(obj.filePath, lodashPath);

						assert.isTrue(isUrl(obj.url));

						done();
					}
				)
				.catch(done);
			}
		);

		it(
			'should create a valid tmp directory',
			function(done) {
				listNpmContents.download(
					{
						filePath: lodashPath,
						url: lodashDist.tarball
					}
				).then(
					function(filePath) {
						assert.equal(fs.writeFile.args[0][0], filePath);
						assert.equal(filePath, lodashPath);

						done();
					}
				)
				.catch(done);
			}
		);

		it(
			'should set the registry to pull info from',
			function(done) {
				var registry = 'http://foo.com/';

				listNpmContents.registry = registry;

				listNpmContents('lodash').then(
					function(results) {

						assert.startsWith(got.get.args[0][0], registry);

						done();
					}
				)
				.catch(done);
			}
		);

		it(
			'should add a trailing slash to the registry when set',
			function() {
				var registry = 'http://foo.com';

				listNpmContents.registry = registry;

				assert.endsWith(listNpmContents.registry, '/');
			}
		);

		it(
			'should not set the registry to non-string object',
			function() {
				var err = null;

				try {
					listNpmContents.registry = null;
				}
				catch (e) {
					err = e;
				}

				assert.isNotNull(err);
				assert.equal(err.message, '.registry can only be set to a valid URL');
			}
		);
	}
);