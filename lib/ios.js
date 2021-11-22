exports.generate = generate;

var fse = require("fs-extra");
var path = require("path");
var input = require("./input");
var output = require("./output");

const iosIcons = [
	{ idiom: "iphone", scale: 2, size: 20 },
	{ idiom: "iphone", scale: 3, size: 20 },
	{ idiom: "iphone", scale: 2, size: 29 },
	{ idiom: "iphone", scale: 3, size: 29 },
	{ idiom: "iphone", scale: 2, size: 40 },
	{ idiom: "iphone", scale: 3, size: 40 },
	{ idiom: "iphone", scale: 2, size: 60 },
	{ idiom: "iphone", scale: 3, size: 60 },
	{ idiom: "ipad", scale: 1, size: 20 },
	{ idiom: "ipad", scale: 2, size: 20 },
	{ idiom: "ipad", scale: 1, size: 29 },
	{ idiom: "ipad", scale: 2, size: 29 },
	{ idiom: "ipad", scale: 1, size: 40 },
	{ idiom: "ipad", scale: 2, size: 40 },
	{ idiom: "ipad", scale: 1, size: 76 },
	{ idiom: "ipad", scale: 2, size: 76 },
	{ idiom: "ipad", scale: 2, size: 83.5 },
	{ idiom: "ios-marketing", scale: 1, size: 1024, flattenAlpha: true }
];

async function* generate(config, fileInput) {
	const fullConfig = await getConfig(config);
	yield* generateImages(fullConfig, fileInput);
	yield* generateManifest(fullConfig);
}

async function getConfig(config) {
	return {
		iosPath: config.iosPath || process.env.iosPath || await getIconsetDir()
	};
}

async function getIconsetDir() {
	await fse.ensureDir(path.join(__dirname, "..", "ios"));
	for (const fileName of await fse.readdir("ios")) {
		const testPath = path.join("ios", fileName, "Images.xcassets");
		if ((await fse.pathExists(testPath)) && (await fse.stat(testPath)).isDirectory)
			return path.join(testPath, "AppIcon.appiconset");
	}
	await fse.ensureDir(path.join(__dirname, "..", "ios", "app", "Images.xcassets"));
	return getIconsetDir();
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
	}, iosIcons.map(icon => ({
		filePath: path.join(config.iosPath, getIconFilename(icon)),
		flattenAlpha: icon.flattenAlpha,
		outputSize: icon.size * icon.scale
	})));
}

async function* generateManifest(config) {
	const fileName = path.join(config.iosPath, "Contents.json");
	yield* output.ensureFileContents(fileName, {
		images: iosIcons.map(icon => ({
			filename: getIconFilename(icon),
			idiom: icon.idiom,
			scale: `${icon.scale}x`,
			size: `${icon.size}x${icon.size}`
		})),
		info: {
			author: "react-native-svg-app-icon",
			version: 1
		}
	}, config);
}

function getIconFilename(icon) {
	return `${icon.idiom}-${icon.size}@${icon.scale}x.png`;
}
