'use strict'

require('./shared')

const mockRequire = require('mock-require')

// will not be available in client code
mockRequire('fusion:environment', {})

// will be available in client code
// webpack will modify to reference the Fusion framework object
// but compilation will still fail if it cannot resolve to something
mockRequire('fusion:variables', {})
