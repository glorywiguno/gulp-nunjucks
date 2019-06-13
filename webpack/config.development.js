const path = require('path');
const common = require(path.resolve(__dirname, 'config.common.js'));

module.exports = {
  mode: 'development',
  ...common
}
