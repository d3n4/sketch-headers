# Sketch Headers

**Headers from [Sketch app](http://www.sketchapp.com).**

## History

| Version                                              | Compare | Patch |
| ---------------------------------------------------- | ------- | ----- |
| [48](https://github.com/skpm/sketch-headers/tree/48) | [47.1...48](https://github.com/skpm/sketch-headers/compare/47.1...48) | [47.1...48](https://github.com/skpm/sketch-headers/compare/47.1...48.diff) |
| [47.1](https://github.com/skpm/sketch-headers/tree/47.1) | [47...47.1](https://github.com/skpm/sketch-headers/compare/47...47.1) | [47...47.1](https://github.com/skpm/sketch-headers/compare/47...47.1.diff) |
| [47](https://github.com/skpm/sketch-headers/tree/47) | X       | X     |

## API

You can access it as a JSON API here:

- https://skpm.github.io/sketch-headers/latest/index.json
- https://skpm.github.io/sketch-headers/VERSION/index.json

## Generating the headers yourself

This will only work if you have this repo cloned next to the Sketch.

1. In the Sketch repo: `git checkout release/n && git submodule update --recursive`
2. In this repo: `npm run deploy -- --sketchVersion=n`

_Disclaimer: The headers are for research purposes only. All code is Copyright © Bohemian Coding._
