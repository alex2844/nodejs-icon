#!/usr/bin/env node

exports.default = void 0;

var fse = require("fs-extra");
var reactNativeSvgAppIcon = require("./index");

const defaultConfig = {
	backgroundPath: "./icon-background.svg",
	foregroundPath: "./icon.svg",
	platforms: ["android", "ios", "desktop", "web"]
};

async function main() {
	console.log("Running react-native-svg-app-icon");
	const cliConfig = defaultConfig;
	if (process.env.backgroundPath)
		cliConfig.backgroundPath = process.env.backgroundPath;
	if (process.env.foregroundPath)
		cliConfig.foregroundPath = process.env.foregroundPath;
	if (process.env.platforms)
		cliConfig.platforms = process.env.platforms.split(',').map(v => v.trim());
	cliConfig.platforms = cliConfig.platforms.map(platform => platform.toLowerCase());
	const generatedFiles = await reactNativeSvgAppIcon.generate({
		icon: {
			backgroundPath: (await fse.pathExists(cliConfig.backgroundPath)) ? cliConfig.backgroundPath : undefined,
			foregroundPath: cliConfig.foregroundPath
		},
		platforms: cliConfig.platforms
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
