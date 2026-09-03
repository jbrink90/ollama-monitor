#!/usr/bin/env node

// # Show current versions
// npm run version

// # Increment versions
// npm run version:major    # 1.0.0 -> 2.0.0
// npm run version:minor    # 1.0.0 -> 1.1.0  
// npm run version:patch    # 1.0.0 -> 1.0.1

// # Or use the script directly
// node scripts/update-version.js major
// node scripts/update-version.js minor
// node scripts/update-version.js patch
// node scripts/update-version.js 1.2.3  # Set specific version

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use current working directory to avoid UNC path issues
const rootDir = process.cwd();
const FILES = {
	packageJson: path.join(rootDir, 'package.json'),
	tauriConf: path.join(rootDir, 'src-tauri', 'tauri.conf.json'),
	cargoToml: path.join(rootDir, 'src-tauri', 'Cargo.toml'),
};

function getCurrentVersions() {
	const packageJson = JSON.parse(fs.readFileSync(FILES.packageJson, 'utf8'));
	const tauriConf = JSON.parse(fs.readFileSync(FILES.tauriConf, 'utf8'));
	const cargoToml = fs.readFileSync(FILES.cargoToml, 'utf8');

	const cargoVersion = cargoToml.match(/^version\s*=\s*"([^"]+)"/m)?.[1];

	return {
		packageJson: packageJson.version,
		tauriConf: tauriConf.version,
		cargoToml: cargoVersion,
	};
}

function incrementVersion(version, type) {
	const parts = version.split('.').map(Number);
	switch (type) {
		case 'major':
			return `${parts[0] + 1}.0.0`;
		case 'minor':
			return `${parts[0]}.${parts[1] + 1}.0`;
		case 'fix':
		case 'patch':
			return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
		default:
			return version;
	}
}

function updateVersion(newVersion) {
	// Update package.json
	const packageJson = JSON.parse(fs.readFileSync(FILES.packageJson, 'utf8'));
	packageJson.version = newVersion;
	fs.writeFileSync(FILES.packageJson, JSON.stringify(packageJson, null, 2) + '\n');

	// Update tauri.conf.json
	const tauriConf = JSON.parse(fs.readFileSync(FILES.tauriConf, 'utf8'));
	tauriConf.version = newVersion;
	fs.writeFileSync(FILES.tauriConf, JSON.stringify(tauriConf, null, 2) + '\n');

	// Update Cargo.toml
	let cargoToml = fs.readFileSync(FILES.cargoToml, 'utf8');
	cargoToml = cargoToml.replace(/^version\s*=\s*"([^"]+)"/m, `version = "${newVersion}"`);
	fs.writeFileSync(FILES.cargoToml, cargoToml);
}

function main() {
	const args = process.argv.slice(2);
	const currentVersions = getCurrentVersions();

	console.log('Current versions:');
	console.log(`  package.json: ${currentVersions.packageJson}`);
	console.log(`  tauri.conf.json: ${currentVersions.tauriConf}`);
	console.log(`  Cargo.toml: ${currentVersions.cargoToml}`);

	if (args.length === 0) {
		console.log('\nUsage: node scripts/update-version.js [major|minor|fix|patch|x.y.z]');
		console.log('  major    - Increment major version (1.0.0 -> 2.0.0)');
		console.log('  minor    - Increment minor version (1.0.0 -> 1.1.0)');
		console.log('  fix/patch- Increment patch version (1.0.0 -> 1.0.1)');
		console.log('  x.y.z    - Set specific version');
		process.exit(1);
	}

	const arg = args[0];
	let newVersion;

	if (['major', 'minor', 'fix', 'patch'].includes(arg)) {
		// Use package.json version as the source of truth
		newVersion = incrementVersion(currentVersions.packageJson, arg);
	} else if (/^\d+\.\d+\.\d+$/.test(arg)) {
		newVersion = arg;
	} else {
		console.error(`Invalid argument: ${arg}`);
		console.log('Use major, minor, fix, patch, or a specific version (x.y.z)');
		process.exit(1);
	}

	console.log(`\nUpdating to version: ${newVersion}`);
	updateVersion(newVersion);
	console.log('✓ All version files updated');
}

main();
