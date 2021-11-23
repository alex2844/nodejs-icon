exports.generate = generate;

var { DOMParser, XMLSerializer } = require('xmldom');
var XML = require('js-global-xml');
var fse = require("fs-extra");
var input = require("./input");
var android = require("./android");
var ios = require("./ios");
var desktop = require("./desktop");
var web = require("./web");

const layerBackgroundPath = "./icon-layer-background.svg";
const layerForegroundPath = "./icon-layer-foreground.svg";

async function* generate(config) {
	const iconContent = fse.readFileSync(config.icon.foregroundPath, "utf-8");
	const iconLayout = (XML.parse(iconContent).svg.g || []);
	if (iconLayout.find(d => (d['inkscape:label'] == 'background')) && iconLayout.find(d => (d['inkscape:label'] == 'foreground'))) {
		config.icon.backgroundPath = layerBackgroundPath;
		config.icon.foregroundPath = layerForegroundPath;
		[ 'background', 'foreground' ].forEach(type => {
			let dom = new DOMParser().parseFromString(iconContent);
			iconLayout.forEach(layout => {
				if (layout['inkscape:label'] != type)
					dom.removeChild(dom.getElementById(layout.id));
				else
					dom.getElementById(layout.id).setAttribute('style', 'display:inline');
			});
			fse.writeFileSync(config.icon[type+'Path'], new XMLSerializer().serializeToString(dom));
		});
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
