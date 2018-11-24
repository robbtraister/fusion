'use strict'

module.exports = (env) => {
  const { isProd } = env

  return (isProd)
    ? require('./aws')(env)
    : require('./local')(env)
}
