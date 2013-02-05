module.exports = process.argv.indexOf('html-cov')>=0
  ? require('./lib-cov/twain')
  : require('./lib/twain');