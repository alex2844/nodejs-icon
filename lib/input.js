exports.inputImageSize = exports.inputContentSize = void 0;
exports.mapInput = mapInput;
exports.readIcon = readIcon;

var fse = require("fs-extra");
var path = require("path");
const sharpImport = require("sharp");

const inputImageSize = 108;
exports.inputImageSize = inputImageSize;
const inputContentSize = 72;
exports.inputContentSize = inputContentSize;

async function readIcon(config) {
	if (config.backgroundPath)
		console.debug("Reading background file", config.backgroundPath);
	if (config.foregroundPath)
		console.debug("Reading file", config.foregroundPath);
	const fullConfig = getConfig(config);
	return {
		read: lazyLoadProvider(fullConfig)
	};
}

function getConfig(config) {
	return {
		backgroundPath: config.backgroundPath || path.join(__dirname, "..", "assets", "default-icon-background.svg"),
		foregroundPath: config.foregroundPath || "./icon.svg"
	};
}

function lazyLoadProvider(config) {
	let lazyLoadedData = undefined;
	return function () {
		if (lazyLoadedData === undefined)
			lazyLoadedData = loadData(config);
		return lazyLoadedData;
	};
}

async function loadData(config) {
	const warmedSharpInstance = await warmupSharp(sharpImport);
	const [
		backgroundImageData, foregroundImageData
	] = await Promise.all([
		readImage(warmedSharpInstance, config.backgroundPath), readImage(warmedSharpInstance, config.foregroundPath)
	]);
	const validBackgroundImage = validateBackgroundImage(backgroundImageData);
	return {
		sharp: warmedSharpInstance,
		backgroundImageData: validBackgroundImage,
		foregroundImageData: foregroundImageData
	};
} // First run might cause a xmllib error, run safe warmup
// See https://github.com/lovell/sharp/issues/1593


async function warmupSharp(sharp) {
	try {
		await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" /></svg>`, "utf-8")).metadata();
	} catch {}// Error only occurs once, so now safe to use sharp
	return sharp;
}

async function readImage(sharp, filePath) {
	const fileData = await fse.readFile(filePath);
	const sharpInstance = sharp(fileData);
	const [
		metadata, stats
	] = await Promise.all([
		sharpInstance.metadata(), sharpInstance.stats()
	]);
	const validMetadata = validateMetadata(metadata);
	return {
		data: fileData,
		metadata: validMetadata,
		stats: stats
	};
}

function validateMetadata(metadata) {
	if (metadata.format !== "svg")
		throw new Error(`Unsupported image format ${metadata.format || "undefined"}.` + `Only SVG images are supported.`);
	if (!metadata.density || !metadata.width || !metadata.height)
		throw new Error("Unsupported image, missing size and density");
	if (metadata.width !== metadata.height)
		throw new Error("Input image not square");
	// TODO: Support different sized images
	if (metadata.width !== inputImageSize || metadata.height !== inputImageSize)
		throw new Error("Input image size not 108x108");
	return {
		...metadata,
		format: metadata.format,
		width: metadata.width,
		height: metadata.height,
		density: metadata.density
	};
}

function validateBackgroundImage(imageData) {
	if (imageData.stats.isOpaque)
		return {
			...imageData,
			stats: {
				...imageData.stats,
				isOpaque: imageData.stats.isOpaque
			}
		};
	else
		throw new Error("Background image needs to be opaque");
}

function mapInput(fileInput, mapFunction) {
	return {
		...fileInput,
		read: async () => {
			const data = await fileInput.read();
			return {
				sharp: data.sharp,
				...mapFunction(data)
			};
		}
	};
}
