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

const packageMeta = require('./fixture/package_meta');

const dist = packageMeta.versions['4.17.4'].dist;

dist.tarball = dist.tarball.replace('lodash-4.17.4.tgz', 'package.tar.gz');

const archivePath = path.join(__dirname, './fixture/package.tar.gz');

const packageArchive = fs.readFileSync(archivePath);

const body = JSON.stringify(packageMeta);

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
							value.body = body;
						}

						return Promise.resolve(value);
					}
				);

				sandbox.stub(fs, 'writeFile').callsArg(2);
				sandbox.stub(tmp, 'dir').callsArgWith(1, null, path.dirname(archivePath));
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
						assert.equal(listNpmContents.normalizeVersion(item, packageMeta), versions[item]);
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
							listNpmContents.normalizeVersion(item, packageMeta);
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
				listNpmContents.createTmp(dist.tarball).then(
					function(obj) {
						assert.isObject(obj);
						assert.equal(obj.filePath, archivePath);

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
						filePath: archivePath,
						url: dist.tarball
					}
				).then(
					function(filePath) {
						assert.equal(fs.writeFile.args[0][0], filePath);
						assert.equal(filePath, archivePath);

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