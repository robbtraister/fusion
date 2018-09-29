'use strict'

const PropTypes = require('../../../../../node_modules/prop-types')

const { taggable } = require('../taggables')

module.exports = (label) => taggable(PropTypes.string, label)
