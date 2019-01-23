'use strict';

const archive = require('ls-archive');
const fs = require('fs');
const got = require('got');
const isUrl = require('is-url');
const path = require('path');
const Promise = require('bluebird');
const tmp = require('tmp');
const registryUrl = require('registry-url');

Promise.promisifyAll(tmp);

tmp.setGracefulCleanup();

Promise.promisifyAll(fs);
Promise.promisifyAll(archive);

const SEMVER = /^(?=\d)((x|\d+)\.?){1,}$/;

let registry = registryUrl();

const createTmp = function(url) {
	return tmp.dirAsync(
		{
			unsafeCleanup: true
		}
	).then(
		function(dirPath) {
			var name = url.split('/').pop();

			const filePath = path.join(dirPath, name);

			return {filePath, url};
		}
	);
};

const download = function(obj) {
	return Promise.resolve(
		got.get(
			obj.url,
			{
				encoding: null
			}
		)
	).then(
		function(response) {
			return fs.writeFileAsync(obj.filePath, response.body);
		}
	)
	.return(obj.filePath);
};

const fetch = function(packageName, version) {
	var url = got.get(registry + packageName.replace(/\//, '%2F')).then(
		function(response) {
			var body = JSON.parse(response.body);

			version = normalizeVersion(version, body);

			var url = body.versions[version].dist.tarball;

			return url;
		}
	);

	return url;
};

const getContents = function(filePath) {
	return archive.listAsync(filePath);
};

const list = function(packageName, version) {
	var results;

	if (!packageName) {
		results = Promise.reject(new Error('You must specify a published package name'));
	}
	else {
		results = list.fetch(packageName, version)
		.then(list.createTmp)
		.then(list.download)
		.then(list.getContents)
		.then(list.processResults);
	}

	return results;
};

const normalizeVersion = function(version, metadata) {
	if (version && SEMVER.test(version)) {
		version = version.replace(/x/g, '0');

		var parts = version.split('.');

		while (parts.length < 3) {
			parts.push(0);
		}

		version = parts.join('.');
	}

	var versions = metadata.versions;
	var distTags = metadata['dist-tags'];

	if (!version) {
		version = 'latest';
	}

	if (!versions[version] && distTags[version]) {
		version = distTags[version];
	}

	if (!versions.hasOwnProperty(version)) {
		throw new Error(`Invalid version: ${version}`);
	}

	return version;
};

const RE = new RegExp(`^package${path.sep.replace('\\', '\\\\')}`);

const processResults = function(results) {
	return results.map(
		function(item, index) {
			return item.getPath().replace(RE, '');
		}
	);
};

Object.assign(
	list,
	{
		createTmp,
		download,
		fetch,
		getContents,
		normalizeVersion,
		processResults
	}
);

Object.defineProperty(
	list,
	'registry',
	{
		get() {
			return registry;
		},

		set: function(url) {
			if (isUrl(url)) {
				if (!url.endsWith('/')) {
					url += '/';
				}

				registry = url;
			}
			else {
				throw new Error('.registry can only be set to a valid URL');
			}
		}
	}
);

module.exports = list;
