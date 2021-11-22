exports.generate = generate;

var path = require("path");
var input = require("./input");
var output = require("./output");
var fs = require('fs');
var pngToIco = require('png-to-ico');

const desktopIcons = [
	{ size: 16 },
	{ size: 24 },
	{ size: 32 }
];

async function* generate(config, fileInput) {
	const fullConfig = await getConfig(config);
	yield* generateImages(fullConfig, fileInput);
    fs.writeFileSync(path.join(fullConfig.desktopPath, "icon.ico"), await pngToIco(desktopIcons.map(icon => path.join(fullConfig.desktopPath, getIconFilename(icon)))));
	desktopIcons.forEach(icon => fs.unlinkSync(path.join(fullConfig.desktopPath, getIconFilename(icon))));
}

async function getConfig(config) {
	return {
		desktopPath: config.desktopPath || process.env.desktopPath || "./desktop"
	};
}

async function* generateImages(config, fileInput) {
	yield* output.genaratePngs({
		...input.mapInput(fileInput, inputData => ({
			baseImage: inputData.backgroundImageData,
			operations: [{
				type: "composite",
				file: inputData.foregroundImageData.data
			}, {
				type: "remove-alpha"
			}]
		})),
		cropSize: input.inputContentSize
	}, desktopIcons.map(icon => ({
		filePath: path.join(config.desktopPath, getIconFilename(icon)),
		outputSize: icon.size
	})));
}

function getIconFilename(icon) {
	return `icon_${icon.size}dp.png`;
}
