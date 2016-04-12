var yaml   = require('yamljs'),
    config = yaml.load('./gulp/config.yml')
;

if (!config.tasks.js) return;

var path            = require('path'),
    webpack         = require('webpack')
;

module.exports = function(env) {
  var jsSrc = path.resolve(config.root.src, config.tasks.js.src),
      jsDest = path.resolve(config.root.dest, config.tasks.js.dest),
      publicPath = path.join(config.tasks.js.dest, '/'),
      filenamePattern = '[name].js',
      extensions = config.tasks.js.extensions.map(function(extension) {
        return '.' + extension
      })
  ;

  var webpackConfig = {
    context: jsSrc,
    plugins: [],
    resolve: {
      root: jsSrc,
      extensions: [''].concat(extensions)
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: config.tasks.js.babel
        }
      ]
    }
  };

  if(env === 'development') {
    webpackConfig.devtool = 'inline-source-map';

    // Create new entries object with webpack-hot-middleware added
    for (var key in config.tasks.js.entries) {
      var entry = config.tasks.js.entries[key];
      
      config.tasks.js.entries[key] = ['webpack-hot-middleware/client?&reload=true'].concat(entry);
    }

    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  if(env !== 'test') {
    // Karma doesn't need entry points or output settings
    webpackConfig.entry = config.tasks.js.entries;

    webpackConfig.output = {
      path: path.normalize(jsDest),
      filename: filenamePattern,
      publicPath: publicPath
    };

    if(config.tasks.js.extractSharedJs) {
      // Factor out common dependencies into a shared.js
      webpackConfig.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
          name: 'shared',
          filename: filenamePattern,
        })
      );
    }
  }

  if(env === 'production') {
    webpackConfig.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.NoErrorsPlugin()
    );
  }

  return webpackConfig;
};