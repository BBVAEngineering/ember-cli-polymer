/* eslint-env node */
/* eslint-disable no-sync */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf').sync;
const exec = require('child_process').exec;

const TEST_TIMEOUT = 120000;
const MOCK_EMBER_CLI_CONFIGS = {
	lazyImport: path.resolve(__dirname, 'ember-cli-build-lazy-import.js'),
	relativePath: path.resolve(__dirname, 'ember-cli-build-relative-path.js'),
	default: path.resolve(__dirname, 'ember-cli-build-default.js'),
	globalPolymerSettings: path.resolve(__dirname, 'ember-cli-build-global-polymer-settings.js'),
	buildForProduction: path.resolve(__dirname, 'ember-cli-build-build-for-production.js')
};
const emberCLIPath = path.resolve(__dirname, '../../node_modules/ember-cli/bin/ember');
const fixturePath = path.resolve(__dirname, '../..');

function runEmberCommand(packagePath, command) {
	return new Promise((resolve, reject) =>
		exec(`${emberCLIPath} ${command}`, {
			cwd: packagePath
		}, (err, result) => {
			if (err) {
				reject(err);
			}
			resolve(result);
		})
	);
}

function outputFilePath(file, dir = 'dist') {
	return path.join(fixturePath, dir, file);
}

function assertContains(filePath, regexp) {
	const fileContent = fs.readFileSync(filePath, 'utf8');

	assert.ok(fileContent.match(regexp), `${filePath} contains ${regexp}`);
}

function assertFileExists(filePath) {
	assert.ok(fs.existsSync(filePath), `${filePath} exists`);
}

function cleanup(packagePath) {
	rimraf(path.join(packagePath, 'dist'));
}

function mockConfig(mockFile) {
	fs.renameSync(path.resolve(fixturePath, 'ember-cli-build.js'), path.resolve(fixturePath, 'ember-cli-build-BACKUP.js'));
	fs.renameSync(mockFile, path.resolve(fixturePath, 'ember-cli-build.js'));
}

function restoreConfig(mockFile) {
	fs.renameSync(path.resolve(fixturePath, 'ember-cli-build.js'), mockFile);
	fs.renameSync(path.resolve(fixturePath, 'ember-cli-build-BACKUP.js'), path.resolve(fixturePath, 'ember-cli-build.js'));
}

describe('ember-cli-build addon options', function() {
	this.timeout(TEST_TIMEOUT);

	context('Setting "lazyImport" to true', () => {
		const mockConfigFile = MOCK_EMBER_CLI_CONFIGS.lazyImport;

		before(() => {
			mockConfig(mockConfigFile);
			return runEmberCommand(fixturePath, 'build --prod');
		});

		after(() => {
			restoreConfig(mockConfigFile);
			return cleanup(fixturePath);
		});

		it('sets rel attribute of the bundle import tag to "lazy-import"', () => {
			assertContains(outputFilePath('index.html'), 'rel="lazy-import"');
		});
	});

	context('Setting "useRelativePaths" to true', () => {
		const mockConfigFile = MOCK_EMBER_CLI_CONFIGS.relativePath;

		before(() => {
			mockConfig(mockConfigFile);
			return runEmberCommand(fixturePath, 'build --prod');
		});

		after(() => {
			restoreConfig(mockConfigFile);
			return cleanup(fixturePath);
		});

		it('sets "bundlerOutput" as the href attribute value of the bundle import tag', () => {
			assertContains(outputFilePath('index.html'), 'href="../any.html"');
		});
	});

	context('Using "globalPolymerSettings"', () => {
		const mockConfigFile = MOCK_EMBER_CLI_CONFIGS.globalPolymerSettings;

		before(() => {
			mockConfig(mockConfigFile);
			return runEmberCommand(fixturePath, 'build --prod');
		});

		after(() => {
			restoreConfig(mockConfigFile);
			return cleanup(fixturePath);
		});

		it('writes a script tag with the Polymer global settings', () => {
			assertContains(outputFilePath('index.html'), '<script>window.Polymer = {');
		});

		it('writes the script tag before the import tag', () => {
			assertContains(outputFilePath('index.html'), '</script>\n<link rel="import"');
		});
	});

	context('Using "buildForProduction"', () => {
		const mockConfigFile = MOCK_EMBER_CLI_CONFIGS.buildForProduction;

		before(() => {
			mockConfig(mockConfigFile);
			return runEmberCommand(fixturePath, 'build --prod');
		});

		after(() => {
			restoreConfig(mockConfigFile);
			return cleanup(fixturePath);
		});

		it('generates separate files for HTML and JavaScript if build.csp is true', () => {
			assertFileExists(fixturePath, 'dist/assets/bundled.html');
			assertFileExists(fixturePath, 'dist/assets/bundled.js');
		});

		it('imports native-shim.js if build.js.compile is true', () => {
			assertContains(outputFilePath('vendor.js', 'dist/assets/'), 'window.HTMLElement');
		});
	});

	context('Using default options', () => {
		const mockConfigFile = MOCK_EMBER_CLI_CONFIGS.default;

		before(() => {
			mockConfig(mockConfigFile);
			return runEmberCommand(fixturePath, 'build --prod');
		});

		after(() => {
			restoreConfig(mockConfigFile);
			return cleanup(fixturePath);
		});

		it('sets rel attribute of the bundle import to "import"', () => {
			assertContains(outputFilePath('index.html'), 'rel="import"');
		});

		it('sets href attribute of the bundle import to an absolute path', () => {
			assertContains(outputFilePath('index.html'), 'href="/');
		});
	});
});
