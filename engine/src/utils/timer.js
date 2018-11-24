'use strict'

/*
 * Simple runtime timer
 *
 * Usage:
 *   const timer = require('./timer')
 *
 *   // start
 *   tic = timer()
 *     - OR -
 *   tic = timer.tic()
 *
 *   // elapsed
 *   elapsed = timer(tic)
 *     - OR -
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

const timer = (t0) => t0 ? toc(t0) : tic()

timer.tic = tic
timer.tick = tic
timer.toc = toc
timer.tock = toc

module.exports = timer
