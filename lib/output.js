exports.ensureFileContents = ensureFileContents;
exports.genaratePngs = genaratePngs;

var fse = require("fs-extra");
var path = require("path");
var input = require("./input");

async function* genaratePngs(fileInput, outputs) {
	for (const output of outputs) {
		yield* genaratePng(fileInput, output);
	}
}

async function* genaratePng(fileInput, output) {
	const {
		sharp, baseImage,
		operations = []
	} = await fileInput.read();
	const metadata = baseImage.metadata;
	await fse.ensureDir(path.dirname(output.filePath));
	const scale = fileInput.cropSize === undefined ? 1 : input.inputImageSize / fileInput.cropSize;
	const targetDensity = output.outputSize / metadata.width * metadata.density * scale;
	let image = sharp(baseImage.data, {
		density: targetDensity
	});
	for (const operation of operations) {
		switch (operation.type) {
			case "composite": {
				let blend;
				switch (operation.blend) {
					case "overlay":
						blend = "over";
						break;
					case "mask":
						blend = "dest-in";
						break;
					default:
						blend = "over";
				}
				image = sharp(await image.composite([{
					input: await sharp(operation.file, {
						density: targetDensity
					}).toBuffer(),
					blend: blend
				}]).toBuffer());
				break;
			}
			case "remove-alpha":
				image = image.removeAlpha();
				break;
		}
	}
	const extractRegion = getExtractRegion(targetDensity, metadata, output.outputSize);
	image = image.extract(extractRegion);
	await image.png({
		adaptiveFiltering: false,
		compressionLevel: 9
	}).toFile(output.filePath);
	yield output.filePath;
}

function getExtractRegion(targetDensity, metadata, outputSize) {
	const imageMargin = Math.floor((targetDensity / metadata.density * metadata.width - outputSize) / 2);
	return {
		top: imageMargin,
		left: imageMargin,
		width: outputSize,
		height: outputSize
	};
}

async function* ensureFileContents(path, content, config) {
	let stringContent;
	switch (typeof content) {
		case "object":
			stringContent = JSON.stringify(content, undefined, 2);
			break;
		case "string":
			stringContent = content;
			break;
		default:
			throw Error("Invalid content");
	}
	const contentBuffer = Buffer.from(stringContent, "utf-8");
	await fse.outputFile(path, contentBuffer);
	yield path;
}
