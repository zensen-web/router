const path = require('path')
const merge = require('webpack-merge')
const createDefaultConfig = require('@open-wc/testing-karma/default-config')

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      colors: true,
      concurrency: Infinity,
      logLevel: config.LOG_INFO,
      frameworks: ['mocha', 'chai'],
      browsers: ['ChromeHeadless'],
      files: [
        config.grep ? config.grep : 'test/**/*.test.js',
      ],
      webpack: {
        mode: 'development',
        devtool: 'inline-source-map',
        module: {
          rules: [
            {
              test: /\.js/,
              include: path.resolve(__dirname),
              exclude: /(test|node_modules)/,
              enforce: 'post',
              use: {
                loader: 'istanbul-instrumenter-loader',
                options: {
                  esModules: true,
                },
              },
            },
          ],
        },
      },
    }),
  )

  return config
}
