'use strict'

module.exports = f => /(\/_+(tests?|snapshots?)_+\/|\.test\.js|\.snap$)/.test(f)
