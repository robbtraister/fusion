'use strict'

const path = require('path')

const { ConcatSource } = require("webpack-sources");

class EnginePlugin {
	apply(compiler) {
    compiler.hooks.emit.tap(this.constructor.name, compilation => {
      const entry = compiler.options.entry
      const entryKeys = Object.keys(entry)

      for (const chunk of compilation.chunks) {
        const chunkResource = chunk.entryModule.resource
        const chunkEntry = entryKeys.find(entryKey => entry[entryKey] === chunkResource)
        if (chunkEntry) {
          const chunkAsset = `${chunkEntry}.js`
          if (Object.hasOwnProperty.call(compilation.assets, chunkAsset)) {
            compilation.assets[chunkAsset] = new ConcatSource(
              compilation.assets[chunkAsset],
              '\n',
              `module.exports.ext='${path.extname(entry[chunkEntry]).replace(/^\./, '')}';`
            )
          }
        }
      }
    })
	}
}

module.exports = EnginePlugin
