'use strict'

/* global describe, it */

const standard = require('mocha-standard')

describe('Linting', function () {
  this.timeout(0)

  it('Ensure all js files conform to linting standards',
    standard.files(
      [ `./**/*.js` ],
      {
        cwd: `${__dirname}/../../..`,
        ignore: [
          'dist/',
          'node_modules/',
          'test/node_modules/'
        ]
      }
    )
  )
})
