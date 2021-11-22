#!/usr/bin/env node

exports.default = void 0;

var fse = require("fs-extra");
var nodejsIcon = require("./index");

const defaultConfig = {
	backgroundPath: "./icon-background.svg",
	foregroundPath: "./icon.svg",
	platforms: ["android", "ios", "desktop", "web"]
};

async function main() {
	const cliConfig = defaultConfig;
	const generatedFiles = await nodejsIcon.generate({
		icon: {
			backgroundPath: (process.env.backgroundPath || ((await fse.pathExists(cliConfig.backgroundPath)) ? cliConfig.backgroundPath : undefined)),
			foregroundPath: (process.env.foregroundPath || cliConfig.foregroundPath)
		},
		platforms: (process.env.platforms ? process.env.platforms.split(',').map(v => v.trim()) : cliConfig.platforms).map(platform => platform.toLowerCase())
	});
	for await (const file of generatedFiles) {
		console.log("Wrote " + file);
	}
	console.log("Done");
}

if (require.main === module)
	void main();

var _default = main;
exports.default = _default;
