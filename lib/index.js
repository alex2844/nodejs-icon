exports.generate = generate;

var input = require("./input");
var android = require("./android");
var ios = require("./ios");

async function* generate(config) {
	const iconInput = await input.readIcon(config.icon);
	if (config.platforms.includes("android"))
		yield* android.generate(config, iconInput);
	if (config.platforms.includes("ios"))
		yield* ios.generate(config, iconInput);
}
