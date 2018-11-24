'use strict'

/*
 * Simple runtime timer
 *
 * Usage:
 *   const timer = require('./timer')
 *   tic = timer.tic()
 *   elapsed = timer.toc(tic)
 *     - OR -
 *   elapsed = tic.toc()
 *
 */

const tic = () => {
  const t0 = process.hrtime()
  t0.toc = t0.tock = () => toc(t0)
  return t0
}
const toc = (tic) => {
  const toc = process.hrtime(tic)
  return toc[0] * 1e3 + toc[1] * 1e-6
}

module.exports = {
  tic,
  tick: tic,
  toc,
  tock: toc
}
