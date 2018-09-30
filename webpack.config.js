var path = require('path');

module.exports = {
  entry: './src/correntlynote.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/js')
  }
};
