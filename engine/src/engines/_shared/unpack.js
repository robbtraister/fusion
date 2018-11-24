'use strict'

module.exports = (mod) => mod && mod.default && mod.__esModule
  ? mod.default
  : mod
