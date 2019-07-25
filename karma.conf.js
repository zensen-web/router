const path = require('path')
const merge = require('webpack-merge')
const createDefaultConfig = require('@open-wc/testing-karma/default-config')

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      colors: true,
      concurrency: Infinity,
      logLevel: config.LOG_INFO,
      frameworks: ['mocha', 'chai'],
      browsers: ['HeadlessChromium'],
      files: [
        config.grep ? config.grep : 'test/**/*.test.js',
      ],
      customLaunchers: {
        HeadlessChromium: {
          base: 'ChromeHeadless',
          flags: [
            '--v=1',
            '--no-sandbox',
            '--remote-debugging-port=9222',
            '--enable-logging',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--proxy-bypass-list=*',
            '--proxy-server=\'direct://\'',
          ],
        },
      },
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
