# nodejs-icon
[![Version](https://img.shields.io/npm/v/nodejs-icon.svg)](https://www.npmjs.org/package/nodejs-icon)

CLI tool for generating all the necessary iOS and Android application launcher icons for projects from a single SVG source file. Features include:

- iOS PNG icon generation
- Desktop ICO icon generation
- Web PNG icon generation
- Android 8.0, and higher, vector drawable adaptive icon generation with PNG fallback
- Android 7.1 legacy circular icon generation
- Android 7.0, and lower, legacy square icon generation

## Installation

```bash
npm install --save-dev nodejs-icon
```

SVG rendering handled by the splendid [`sharp`](https://github.com/lovell/sharp) library, meaning no dependencies outside of npm is required.

Requires node version 12, or later.

## Usage

Place your square 108x108 SVG app icon file named `icon.svg` in the project root and run

```bash
npx nodejs-icon
```

This will generate all the required icons under the `android/` and `ios/` directories.

### Icon background

If you want to use a separate background layer for Android adaptive icons, or because your source icon file doesn't contain a background, you can create an `icon-background.svg` file which will be used as the background layer for the generated icons.

In case you want to produce both foreground and background layers from a single SVG file, you can use [svg-deconstruct](https://github.com/not-fred/svg-deconstruct) to split layers to separate files. See configuration section below on how to specify input file paths.

## Configuration
Supported configuration values are

| Field            | Default                   | Description                                                                                                                                                     |
| ---------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `foregroundPath` | `"./icon.svg"`            | Input file path for the foreground layer. File needs to exist, and may contain transparency.                                                                    |
| `backgroundPath` | `"./icon-background.svg"` | Input file path for the background layer. File doesn't need to exist, and will default to a fully white background. If file exist, it needs to be fully opaque. |
| `platforms`      | `["android", "ios"]`      | Array of platforms for which application launcher icons should be generated. Possible values are `android` and `ios`.                                           |

## Icon format

The input icon should be a SVG file adhering to the [Android adaptive icon specification](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive). Specifically, the image should:

- Be a valid SVG image
- have a 1:1 aspect ratio
- Have a size of 108x108dp

of which the:

- Center 72x72dp square is the normally visible area
- Center 66dp diameter circle is the safe area which will always be visible

With the various icons cropped according to the following image

![Icon copping anatomy](cropping.svg)

For an example icon file, see [`example/layered.svg`](example/layered.svg).

## Troubleshooting

### Supported SVG features

Most common SVG features are supported, including masks and styles. The underlying SVG rendering library is [`librsvg`](https://developer.gnome.org/rsvg/stable/rsvg.html) which claims to support most SVG 1.1 features, excluding scripts, animations and SVG fonts.

## Future improvements

- Add generation of Android notification icons
- Add generation of Android TV banner
