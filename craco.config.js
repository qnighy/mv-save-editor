module.exports = {
  babel: {
    presets: ["@linaria"],
  },
  webpack: {
    configure(webpackConfig, { env }) {
      webpackConfig.module.rules.push({
        test: /\.([jt]sx?|[mc][jt]s)$/,
        loader: '@linaria/webpack-loader',
        options: {
          sourceMap: env.NODE_ENV !== 'production',
        },
      });
      return webpackConfig;
    },
  },
};
