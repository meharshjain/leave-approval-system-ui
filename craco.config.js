const path = require('path');

// Helper function to remove react-refresh from babel plugins
function removeReactRefresh(plugins) {
  if (!Array.isArray(plugins)) return plugins;
  return plugins.filter((plugin) => {
    // Handle string plugins
    if (typeof plugin === 'string') {
      return !plugin.includes('react-refresh');
    }
    // Handle array format: [plugin, options]
    if (Array.isArray(plugin)) {
      const pluginName = plugin[0];
      if (typeof pluginName === 'string') {
        return !pluginName.includes('react-refresh');
      }
      // Handle require() based plugins
      if (pluginName && pluginName.toString && pluginName.toString().includes('react-refresh')) {
        return false;
      }
    }
    // Handle function/object plugins - check toString
    if (plugin && plugin.toString && plugin.toString().includes('react-refresh')) {
      return false;
    }
    return true;
  });
}

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig, { env }) => {
      // Ensure NODE_ENV is set correctly for production builds
      const isProduction = env === 'production' || process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        process.env.NODE_ENV = 'production';
        
        // Remove ReactRefreshWebpackPlugin if present
        if (webpackConfig.plugins && Array.isArray(webpackConfig.plugins)) {
          webpackConfig.plugins = webpackConfig.plugins.filter((plugin) => {
            if (plugin && plugin.constructor && plugin.constructor.name) {
              return !plugin.constructor.name.includes('ReactRefresh');
            }
            if (plugin && plugin.toString) {
              return !plugin.toString().includes('ReactRefresh');
            }
            return true;
          });
        }
        
        // Remove react-refresh plugin from all babel-loader instances
        if (webpackConfig.module && webpackConfig.module.rules) {
          webpackConfig.module.rules.forEach((rule) => {
            // Handle oneOf rules (used by react-scripts)
            if (rule.oneOf && Array.isArray(rule.oneOf)) {
              rule.oneOf.forEach((oneOfRule) => {
                // Handle direct loader
                if (oneOfRule.loader && oneOfRule.loader.includes('babel-loader')) {
                  if (oneOfRule.options && oneOfRule.options.plugins) {
                    oneOfRule.options.plugins = removeReactRefresh(oneOfRule.options.plugins);
                  }
                }
                // Handle use array
                if (oneOfRule.use && Array.isArray(oneOfRule.use)) {
                  oneOfRule.use.forEach((use) => {
                    if (use.loader && use.loader.includes('babel-loader')) {
                      if (use.options && use.options.plugins) {
                        use.options.plugins = removeReactRefresh(use.options.plugins);
                      }
                    }
                  });
                }
              });
            }
            // Handle regular rules
            if (rule.use && Array.isArray(rule.use)) {
              rule.use.forEach((use) => {
                if (use.loader && use.loader.includes('babel-loader')) {
                  if (use.options && use.options.plugins) {
                    use.options.plugins = removeReactRefresh(use.options.plugins);
                  }
                }
              });
            }
          });
        }
      }
      return webpackConfig;
    },
  },
};

