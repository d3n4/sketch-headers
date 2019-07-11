#!/usr/bin/env node

const fs = require('fs-extra')
const rimraf = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const parseHeader = require('./parse-header')

const output = path.join(__dirname, '../headers')

const SKETCH_SOURCES_PATH = path.join(__dirname, '../../Sketch')
const MACOS_FOUNDATION_PATH =
  '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/System/Library/Frameworks/Foundation.framework/Headers'
const MACOS_APPKIT_PATH =
  '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/System/Library/Frameworks/AppKit.framework/Headers'
const MACOS_CORE_GRAPHICS_PATH =
  '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/System/Library/Frameworks/CoreGraphics.framework/Headers'
const MACOS_QUARTZ_CORE_PATH =
  '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/System/Library/Frameworks/QuartzCore.framework/Headers'
const MACOS_SYSTEM_PATH =
  '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include/objc'

const ignoredHeaders = ['Modules/OpenSSL', 'Modules/SketchAPI', 'Modules/WebP', 'Modules/Minizip', 'Modules/CocoaScript/src/framework/imagetools', 'Modules/CocoaScript/src/editor', 'Modules/AFNetworking/Tests', 'Modules/CocoaScript/src/framework/fmdb', 'Modules/ECLogging', 'Modules/FMDB', 'Modules/SketchModel/Tests', 'Modules/GCDWebServer', 'Modules/OHHTTPStubs', 'Modules/PeerTalk', 'Modules/PocketSocket', 'Modules/SketchRendering/Tests', 'Modules/SketchTool/Tests']

function generate() {
  const now = Date.now()

  const classes = {}

  function parseHeaders(input) {
    const files = fs.readdirSync(input)
    files.forEach(file => {
      const filePath = path.join(input, file)
      if (ignoredHeaders.some(h => filePath.indexOf(h) !== -1)) {
        // ignored
        return
      }

      const stat = fs.lstatSync(filePath)
      if (stat.isDirectory()) {
        parseHeaders(filePath)
        return
      }
      if (stat.isSymbolicLink()) {
        return
      }
      if (path.extname(filePath) !== '.h') {
        // we only care about headers
        return
      }

      let data = fs.readFileSync(filePath, 'utf8')
      if (!data) {
        return
      }
      data = parseHeader(data, filePath)

      // if (filePath.match('NSApplication.h')) {
      //   console.log(data)
      // }

      data.forEach(obj => {
        const key = `${obj.name}${
          obj.protocol
            ? '__protocol'
            : obj.struct
            ? '__type'
            : obj.typeAlias
            ? '__type'
            : obj.enum
            ? '__type'
            : ''
        }`

        if (!obj.struct && !obj.typeAlias && !obj.enum && classes[key]) {
          // merge
          if (!classes[key].extends) {
            classes[key].extends = obj.extends
          }

          Array.from(obj.interfaces).forEach(i =>
            classes[key].interfaces.push(i)
          )

          Object.keys(obj.methods).forEach(k => {
            classes[key].methods[k] = obj.methods[k]
          })
          Object.keys(obj.properties).forEach(k => {
            classes[key].properties[k] = obj.properties[k]
          })
        } else {
          classes[key] = obj
        }
      })
    })
  }

  // console.log('Parsing System include...')
  // parseHeaders(MACOS_SYSTEM_PATH)
  // console.log('Parsing Quartz Core...')
  // parseHeaders(MACOS_QUARTZ_CORE_PATH)
  // console.log('Parsing Core Graphics...')
  // parseHeaders(MACOS_CORE_GRAPHICS_PATH)
  // console.log('Parsing Foundation...')
  // parseHeaders(MACOS_FOUNDATION_PATH)
  // console.log('Parsing AppKit...')
  // parseHeaders(MACOS_APPKIT_PATH)
  console.log('Parsing Sketch Sources...')
  parseHeaders(SKETCH_SOURCES_PATH)

  try {
    rimraf.sync(output)
  } catch (err) {}

  fs.ensureDirSync(output)
  fs.ensureDirSync(path.join(output, 'protocols'))
  fs.ensureDirSync(path.join(output, 'structs'))
  fs.ensureDirSync(path.join(output, 'typeAliases'))
  fs.ensureDirSync(path.join(output, 'enums'))

  Object.keys(classes).forEach(className => {
    const obj = classes[className]
    const fileName = `${obj.protocol
      ? 'protocols/'
      : obj.struct
      ? 'structs/'
      : obj.typeAlias
      ? 'typeAliases/'
      : obj.enum
      ? 'enums/'
      : ''}${encodeURIComponent(obj.name)}.json`
    fs.writeFileSync(
      path.join(output, fileName),
      JSON.stringify(classes[className], null, 2),
      'utf8'
    )
  })

  fs.writeFileSync(
    path.join(output, 'index.json'),
    JSON.stringify(Object.keys(classes).map(className => {
      const obj = classes[className]
      return `${obj.protocol
        ? 'protocols/'
        : obj.struct
        ? 'structs/'
        : obj.typeAlias
        ? 'typeAliases/'
        : obj.enum
        ? 'enums/'
        : ''}${encodeURIComponent(obj.name)}.json`
    }), null, 2),
    'utf8'
  );

  console.log(
    `${chalk.green('Done')} ${chalk.dim(`in ${Date.now() - now}ms!`)}`
  )
}

if (require.main === module) {
  generate()
} else {
  module.exports = generate
}
