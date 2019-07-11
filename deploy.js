#!/usr/bin/env node

// usage: npm run deploy -- --sketchVersion=48-beta2

const fs = require('fs')
const {argv} = require('yargs')
const {exec} = require('child-process-promise')

const version = argv.sketchVersion

if (!version) {
  console.error('Missing "sketchVersion" option')
  process.exit(1)
}

const readme = fs.readFileSync('./README.md', {encoding: 'utf8'})

const delimiter = '| ---------------------------------------------------- | ------- | ----- |'
const startOfTable = readme.indexOf(delimiter) + delimiter.length

const startOfReadme = readme.slice(0, startOfTable)
const endOfReadme = readme.slice(startOfTable)

let previousVersion = (new RegExp(/\| \[(.*?)\]/g)).exec(readme.slice(startOfTable))
previousVersion = previousVersion ? previousVersion[1] : previousVersion

fs.writeFileSync(
  './README.md',
  startOfReadme + `\n| [${version}](https://github.com/skpm/sketch-headers/tree/${version}) | ${previousVersion ? `[${previousVersion}...${version}](https://github.com/skpm/sketch-headers/compare/${previousVersion}...${version})` : 'X'} | ${previousVersion ? `[${previousVersion}...${version}](https://github.com/skpm/sketch-headers/compare/${previousVersion}...${version}.diff)` : 'X'} |` + endOfReadme,
  {encoding: 'utf8'})

require('./lib')(argv)
.then(() => {
  return exec(`git add . && git commit -m "version ${version}" && git tag ${version} && git push && git push origin ${version} && cp -r headers .temp-headers && git checkout gh-pages && cp -r .temp-headers ${version} && rm -rf latest && cp -r .temp-headers latest && git add . && git commit -m "version ${version}" && git push && git checkout master && rm -rf .temp-headers`, {maxBuffer: 1024 * 3000})
})
.then(() => console.log('done'))
.catch(console.error)


