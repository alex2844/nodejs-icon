exports.generate = generate;

var path = require("path");
var input = require("./input");
var output = require("./output");

const webIcons = [
	{ scale: 1, size: 512 },
	{ scale: 2, size: 96 },
	{ scale: 2, size: 64 },
	{ scale: 1, size: 96 },
	{ scale: 1, size: 64 }
];

async function* generate(config, fileInput) {
	const fullConfig = await getConfig(config);
	yield* generateImages(fullConfig, fileInput);
}

async function getConfig(config) {
	return {
		webPath: config.webPath || process.env.webPath || "./web/icons"
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
	}, webIcons.map(icon => ({
		filePath: path.join(config.webPath, getIconFilename(icon)),
		outputSize: icon.size * icon.scale
	})));
}

function getIconFilename(icon) {
	return `${icon.size*icon.scale}px-${icon.size}dp${icon.scale}x.png`;
}
