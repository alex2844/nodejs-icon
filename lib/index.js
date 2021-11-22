exports.generate = generate;

var input = require("./input");
var android = require("./android");
var ios = require("./ios");
var desktop = require("./desktop");
var web = require("./web");

async function* generate(config) {
	const iconInput = await input.readIcon(config.icon);
	if (config.platforms.includes("android"))
		yield* android.generate(config, iconInput);
	if (config.platforms.includes("ios"))
		yield* ios.generate(config, iconInput);
	if (config.platforms.includes("desktop"))
		yield* desktop.generate(config, iconInput);
	if (config.platforms.includes("web"))
		yield* web.generate(config, iconInput);
}
