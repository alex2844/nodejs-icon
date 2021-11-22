exports.generate = generate;

var fse = require("fs-extra");
var input = require("./input");
var android = require("./android");
var ios = require("./ios");
var desktop = require("./desktop");
var web = require("./web");

const layerBackgroundPath = "./icon-layer-background.svg";
const layerForegroundPath = "./icon-layer-foreground.svg";

function addStringAtPos(original, add, position) {
	return original.substring(0, position).replace(/style="(.*?)"$/, '') + add + original.substring(position);
}

async function* generate(config) {
	const iconContent = fse.readFileSync(config.icon.foregroundPath, "utf-8");
	const _foreCloseTagMatch = /(?<=label="foreground"[\s\S]*)(>)/gm.exec(iconContent);
	const _backCloseTagMatch = /(?<=label="background"[\s\S]*)(>)/gm.exec(iconContent);
	if (_foreCloseTagMatch && _backCloseTagMatch) {
		const backgroundContent = addStringAtPos(iconContent, ' style="display:none"', _foreCloseTagMatch.index);
		const foregroundContent = addStringAtPos(iconContent, ' style="display:none"', _backCloseTagMatch.index);
		fse.writeFileSync((config.icon.backgroundPath = layerBackgroundPath), backgroundContent);
		fse.writeFileSync((config.icon.foregroundPath = layerForegroundPath), foregroundContent);
		console.log("Created both layer files");
	}
	const iconInput = await input.readIcon(config.icon);
	if (config.platforms.includes("android"))
		yield* android.generate(config, iconInput);
	if (config.platforms.includes("ios"))
		yield* ios.generate(config, iconInput);
	if (config.platforms.includes("desktop"))
		yield* desktop.generate(config, iconInput);
	if (config.platforms.includes("web"))
		yield* web.generate(config, iconInput);
	if (config.icon.foregroundPath == layerForegroundPath) {
		fse.unlinkSync(layerBackgroundPath);
		fse.unlinkSync(layerForegroundPath);
	}
}
