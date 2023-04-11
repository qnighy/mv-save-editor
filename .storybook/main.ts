import type { StorybookConfig } from "@storybook/react-webpack5";
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../public"],
  babel: async (options) => ({
    ...options,
    presets: [...options.presets ?? [], "@linaria"],
  }),
  webpackFinal: async (config, { configType }) => {
    config.module!.rules!.push({
      test: /\.([jt]sx?|[mc][jt]s)$/,
      loader: '@linaria/webpack-loader',
      options: {
        sourceMap: configType !== 'PRODUCTION',
      },
    });
    return config;
  },
};
export default config;
