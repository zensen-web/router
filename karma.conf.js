const createDefaultConfig = require('@open-wc/testing-karma/default-config')
const merge = require('deepmerge')

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        { pattern: config.grep ? config.grep : 'test/**/*.test.js', type: 'module' },
      ],
      esm: {
        nodeResolve: true,
      },
    }),
  )

  return config
}
